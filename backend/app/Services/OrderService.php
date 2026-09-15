<?php
declare(strict_types=1);

namespace App\Services;

use App\Contracts\Repositories\OrderRepositoryInterface;
use App\Contracts\Repositories\InventoryRepositoryInterface;
use App\DTOs\Order\CreateOrderDTO;
use App\DTOs\Order\OrderFilterDTO;
use App\DTOs\Order\UpdateOrderStatusDTO;
use App\DTOs\Inventory\StockAdjustmentDTO;
use App\Enums\OrderStatus;
use App\Enums\StockMovementType;
use App\Events\Order\OrderCreated;
use App\Events\Order\OrderStatusChanged;
use App\Exceptions\OrderCannotBeCancelledException;
use App\Exceptions\InsufficientStockException;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class OrderService
{
    public function __construct(
        private readonly OrderRepositoryInterface $orderRepository,
        private readonly InventoryRepositoryInterface $inventoryRepository,
        private readonly CartService $cartService,
    ) {}

    public function getAll(OrderFilterDTO $filters): LengthAwarePaginator
    {
        return $this->orderRepository->getFiltered($filters);
    }

    public function getById(string $id): ?Model
    {
        return $this->orderRepository->findWithRelations($id);
    }

    public function createFromCart(CreateOrderDTO $dto): Model
    {
        return DB::transaction(function () use ($dto) {
            $cart = \App\Models\Cart::with(['items.product', 'items.variant'])
                ->find($dto->cart_id);

            if (!$cart || $cart->items->isEmpty()) {
                throw new \RuntimeException('Cart is empty or not found');
            }

            $totals = $this->cartService->calculateTotals($cart);

            $orderNumber = 'ORD-' . strtoupper(Str::random(8)) . '-' . now()->format('YmdHis');

            $order = $this->orderRepository->create([
                'order_number' => $orderNumber,
                'user_id' => $dto->customer_id,
                'customer_id' => $dto->customer_id,
                'status' => OrderStatus::Pending->value,
                'payment_status' => 'pending',
                'shipping_status' => 'pending',
                'subtotal' => $totals['subtotal'],
                'discount_total' => $totals['discount'],
                'shipping_total' => $totals['shipping'],
                'tax_total' => $totals['tax'],
                'grand_total' => $totals['total'],
                'paid_total' => 0,
                'due_total' => $totals['total'],
                'currency' => 'INR',
                'notes' => $dto->notes,
                'is_gift' => $dto->is_gift,
                'gift_message' => $dto->gift_message,
                'source' => $dto->source,
            ]);

            foreach ($cart->items as $item) {
                $variant = $item->variant;

                if ($variant && $variant->is_tracked && $variant->stock < $item->quantity) {
                    throw new InsufficientStockException(
                        "Insufficient stock for variant {$variant->sku}"
                    );
                }

                $order->items()->create([
                    'product_id' => $item->product_id,
                    'variant_id' => $item->variant_id,
                    'product_name' => $item->product->name,
                    'product_sku' => $variant?->sku,
                    'variant_label' => $variant?->name,
                    'quantity' => $item->quantity,
                    'unit_price' => $item->unit_price,
                    'subtotal' => $item->subtotal,
                    'tax_total' => $item->tax_amount ?? 0,
                    'grand_total' => $item->total,
                ]);

                if ($variant) {
                    $this->inventoryRepository->adjustStock(new StockAdjustmentDTO(
                        variant_id: $variant->id,
                        warehouse_id: $this->getDefaultWarehouse(),
                        quantity: $item->quantity,
                        type: StockMovementType::Sale,
                        reason: "Order #{$orderNumber}",
                        reference_type: 'order',
                        reference_id: $order->id,
                    ));
                }
            }

            $order->timeline()->create([
                'status' => OrderStatus::Pending->value,
                'notes' => 'Order placed successfully',
                'created_by' => auth()->id(),
            ]);

            $this->cartService->clear($cart->id);

            OrderCreated::dispatch($order);

            return $order->load(['items', 'customer', 'timeline']);
        });
    }

    public function updateStatus(string $id, UpdateOrderStatusDTO $dto): Model
    {
        return DB::transaction(function () use ($id, $dto) {
            $order = $this->orderRepository->findOrFail($id);
            $oldStatus = $order->status;
            $newStatus = $dto->status;

            $allowedTransitions = OrderStatus::allowedTransitions();

            if (!isset($allowedTransitions[$oldStatus])) {
                throw new \RuntimeException("No transitions allowed from status: {$oldStatus}");
            }

            $allowed = array_map(fn (OrderStatus $s) => $s->value, $allowedTransitions[$oldStatus]);

            if (!in_array($newStatus, $allowed)) {
                throw new \RuntimeException(
                    "Cannot transition from {$oldStatus} to {$newStatus}"
                );
            }

            $this->orderRepository->update($order, ['status' => $newStatus]);

            $order->timeline()->create([
                'status' => $newStatus,
                'notes' => $dto->notes ?? "Status changed from {$oldStatus} to {$newStatus}",
                'created_by' => auth()->id(),
            ]);

            if ($dto->notify_customer || in_array($newStatus, [OrderStatus::Shipped->value, OrderStatus::Delivered->value, OrderStatus::Cancelled->value], true)) {
                $this->sendStatusEmail($order, $newStatus, $dto->notes);
            }

            OrderStatusChanged::dispatch($order, $oldStatus, $newStatus);

            return $order->fresh()->load(['items', 'timeline', 'customer']);
        });
    }

    public function getTimeline(string $id): Collection
    {
        return $this->orderRepository->getTimeline($id);
    }

    public function addNote(string $id, string $note, bool $customerVisible): Model
    {
        $order = $this->orderRepository->findOrFail($id);

        $order->notes()->create([
            'note' => $note,
            'customer_visible' => $customerVisible,
            'created_by' => auth()->id(),
        ]);

        return $order->fresh()->load('notes');
    }

    public function generateInvoice(string $id): string
    {
        $order = $this->orderRepository->findWithRelations($id);

        $pdf = Pdf::loadView('invoices.template', [
            'order' => $order,
        ]);

        $path = "invoices/invoice-{$order->order_number}.pdf";
        $pdf->save(storage_path("app/public/{$path}"));

        return $path;
    }

    public function getMyOrders(string $customerId): LengthAwarePaginator
    {
        $filters = OrderFilterDTO::fromArray([
            'customer_id' => $customerId,
            'sort_by' => 'created_at',
            'sort_order' => 'desc',
            'per_page' => 15,
        ]);

        return $this->orderRepository->getFiltered($filters);
    }

    public function cancelOrder(string $id): Model
    {
        return DB::transaction(function () use ($id) {
            $order = $this->orderRepository->findOrFail($id);

            $allowedCancellable = [OrderStatus::Pending->value, OrderStatus::Confirmed->value];

            if (!in_array($order->status, $allowedCancellable)) {
                throw new OrderCannotBeCancelledException(
                    "Order cannot be cancelled in status: {$order->status}"
                );
            }

            $this->orderRepository->update($order, [
                'status' => OrderStatus::Cancelled->value,
            ]);

            foreach ($order->items as $item) {
                if ($item->variant_id) {
                    $this->inventoryRepository->adjustStock(new StockAdjustmentDTO(
                        variant_id: $item->variant_id,
                        warehouse_id: $this->getDefaultWarehouse(),
                        quantity: $item->quantity,
                        type: StockMovementType::Return,
                        reason: "Cancelled order #{$order->order_number}",
                        reference_type: 'order',
                        reference_id: $order->id,
                    ));
                }
            }

            $order->timeline()->create([
                'status' => OrderStatus::Cancelled->value,
                'notes' => 'Order cancelled',
                'created_by' => auth()->id(),
            ]);

            $this->sendStatusEmail($order, OrderStatus::Cancelled->value, 'Order cancelled');

            OrderStatusChanged::dispatch($order, $order->status, OrderStatus::Cancelled->value);

            return $order->fresh()->load(['items', 'timeline']);
        });
    }

    private function sendStatusEmail(Model $order, string $newStatus, ?string $notes = null): void
    {
        $recipientEmail = $order->shipping_email ?? $order->billing_email ?? $order->customer?->email ?? $order->user?->email;
        if (!$recipientEmail) {
            return;
        }

        try {
            switch ($newStatus) {
                case OrderStatus::Shipped->value:
                case 'shipped':
                    \Illuminate\Support\Facades\Mail::to($recipientEmail)->send(
                        new \App\Mail\Order\OrderShippedEmail($order)
                    );
                    break;
                case OrderStatus::Delivered->value:
                case 'delivered':
                    \Illuminate\Support\Facades\Mail::to($recipientEmail)->send(
                        new \App\Mail\Order\OrderDeliveredEmail($order)
                    );
                    break;
                case OrderStatus::Cancelled->value:
                case 'cancelled':
                    \Illuminate\Support\Facades\Mail::to($recipientEmail)->send(
                        new \App\Mail\Order\OrderCancelledEmail($order, $notes)
                    );
                    break;
            }
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::error('Failed to send status update email', [
                'order_id' => $order->id,
                'status' => $newStatus,
                'email' => $recipientEmail,
                'error' => $e->getMessage(),
            ]);
        }
    }

    private function getDefaultWarehouse(): ?string
    {
        $warehouse = \App\Models\Warehouse::where('is_active', true)
            ->where('is_primary', true)
            ->first();

        if (!$warehouse) {
            $warehouse = \App\Models\Warehouse::where('is_active', true)->first();
        }

        return $warehouse?->id;
    }

    private function findWithRelations(string $id): ?Model
    {
        return $this->orderRepository->findWithRelations($id);
    }
}
