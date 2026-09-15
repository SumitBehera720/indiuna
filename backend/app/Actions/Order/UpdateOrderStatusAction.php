<?php
declare(strict_types=1);

namespace App\Actions\Order;

use App\DTOs\Order\UpdateOrderStatusDTO;
use App\Enums\OrderStatus;
use App\Enums\StockMovementType;
use App\Events\Order\OrderStatusChanged;
use App\Models\Order;
use App\Models\StockMovement;
use App\Repositories\OrderRepository;
use Illuminate\Support\Facades\DB;

class UpdateOrderStatusAction
{
    public function __construct(
        private readonly OrderRepository $orderRepository,
    ) {}

    public function execute(string $orderId, UpdateOrderStatusDTO $dto): Order
    {
        return DB::transaction(function () use ($orderId, $dto) {
            $order = $this->orderRepository->findOrFail($orderId);
            $oldStatus = $order->status;
            $newStatus = OrderStatus::from($dto->status);

            $allowed = OrderStatus::allowedTransitions()[$oldStatus->value] ?? [];
            $isAllowed = collect($allowed)->contains(fn (OrderStatus $s) => $s === $newStatus);

            if (!$isAllowed) {
                throw new \RuntimeException(
                    "Cannot transition from {$oldStatus->value} to {$newStatus->value}"
                );
            }

            if ($newStatus === OrderStatus::Cancelled) {
                $this->restoreInventory($order);
            }

            $updateData = ['status' => $newStatus];
            $timestamps = [
                OrderStatus::Confirmed->value => 'confirmed_at',
                OrderStatus::Shipped->value => 'shipped_at',
                OrderStatus::Delivered->value => 'delivered_at',
                OrderStatus::Cancelled->value => 'cancelled_at',
                OrderStatus::Returned->value => 'returned_at',
                OrderStatus::Refunded->value => 'refunded_at',
            ];

            if (isset($timestamps[$newStatus->value])) {
                $updateData[$timestamps[$newStatus->value]] = now();
            }

            $order->update($updateData);

            $order->statusHistory()->create([
                'status' => $newStatus,
                'notes' => $dto->notes,
                'changed_by' => auth()->id(),
            ]);

            event(new OrderStatusChanged($order, $oldStatus, $newStatus));

            return $order->fresh()->load(['customer', 'items', 'statusHistory', 'payments', 'shipments']);
        });
    }

    private function restoreInventory(Order $order): void
    {
        foreach ($order->items as $item) {
            if ($item->variant && $item->variant->is_tracked) {
                $item->variant->increment('stock', $item->quantity);

                StockMovement::create([
                    'variant_id' => $item->variant_id,
                    'warehouse_id' => $item->variant->inventories()->first()?->warehouse_id,
                    'type' => StockMovementType::Return,
                    'quantity' => $item->quantity,
                    'before_quantity' => $item->variant->stock - $item->quantity,
                    'after_quantity' => $item->variant->stock,
                    'reference_type' => Order::class,
                    'reference_id' => $order->id,
                    'reason' => 'Order cancelled',
                ]);
            }
        }
    }
}
