<?php
declare(strict_types=1);

namespace App\Actions\Order;

use App\DTOs\Order\CreateOrderDTO;
use App\Enums\OrderStatus;
use App\Enums\PaymentStatus;
use App\Enums\ShippingStatus;
use App\Enums\StockMovementType;
use App\Events\Order\OrderCreated;
use App\Exceptions\InsufficientStockException;
use App\Models\Cart;
use App\Models\Order;
use App\Models\StockMovement;
use App\Repositories\OrderRepository;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class CreateOrderAction
{
    public function __construct(
        private readonly OrderRepository $orderRepository,
    ) {}

    public function execute(CreateOrderDTO $dto): Order
    {
        return DB::transaction(function () use ($dto) {
            $cart = Cart::with(['items.product', 'items.variant', 'coupon'])
                ->findOrFail($dto->cart_id);

            $this->validateStock($cart);

            $totals = $this->calculateTotals($cart);

            $orderNumber = $this->generateOrderNumber();

            $order = $this->orderRepository->create([
                'order_number' => $orderNumber,
                'customer_id' => $dto->customer_id,
                'status' => OrderStatus::Pending,
                'payment_status' => PaymentStatus::Pending,
                'shipping_status' => ShippingStatus::Pending,
                'fulfillment_status' => 'pending',
                'subtotal' => $totals['subtotal'],
                'discount_total' => $totals['discount'],
                'shipping_total' => $totals['shipping'],
                'tax_total' => $totals['tax'],
                'grand_total' => $totals['total'],
                'paid_total' => 0,
                'due_total' => $totals['total'],
                'coupon_code' => $cart->coupon_code,
                'coupon_id' => $cart->coupon_id,
                'notes' => $dto->notes,
                'is_gift' => $dto->is_gift,
                'gift_message' => $dto->gift_message,
                'source' => $dto->source,
                'channel' => 'web',
            ]);

            foreach ($cart->items as $cartItem) {
                $order->items()->create([
                    'product_id' => $cartItem->product_id,
                    'variant_id' => $cartItem->variant_id,
                    'product_name' => $cartItem->product?->name,
                    'variant_label' => $cartItem->variant?->name,
                    'product_sku' => $cartItem->variant?->sku,
                    'quantity' => $cartItem->quantity,
                    'unit_price' => $cartItem->unit_price,
                    'discount_total' => $cartItem->discount_amount ?? 0,
                    'tax_total' => $cartItem->tax_amount ?? 0,
                    'tax_rate' => $cartItem->tax_rate ?? 0,
                    'grand_total' => $cartItem->total,
                    'meta_data' => $cartItem->metadata ?? [],
                ]);

                if ($cartItem->variant && $cartItem->variant->is_tracked) {
                    $this->deductInventory($cartItem, $order);
                }
            }

            $order->timeline()->create([
                'status' => OrderStatus::Pending->value,
                'notes' => 'Order placed',
                'created_by' => null,
            ]);

            $cart->items()->delete();
            $cart->update([
                'subtotal' => 0,
                'discount_total' => 0,
                'shipping_total' => 0,
                'tax_total' => 0,
                'grand_total' => 0,
                'coupon_code' => null,
                'coupon_id' => null,
                'is_active' => false,
            ]);

            event(new OrderCreated($order));

            return $order->load(['customer', 'items', 'statusHistory', 'payments', 'shipments']);
        });
    }

    private function validateStock(Cart $cart): void
    {
        foreach ($cart->items as $item) {
            if ($item->variant && $item->variant->is_tracked) {
                $available = $item->variant->stock;
                if ($item->quantity > $available) {
                    throw new InsufficientStockException(
                        "Insufficient stock for {$item->product?->name} ({$item->variant?->sku}). Available: {$available}, requested: {$item->quantity}"
                    );
                }
            }
        }
    }

    private function calculateTotals(Cart $cart): array
    {
        return [
            'subtotal' => (float) $cart->subtotal,
            'discount' => (float) ($cart->discount_total ?? 0),
            'shipping' => (float) ($cart->shipping_total ?? 0),
            'tax' => (float) ($cart->tax_total ?? 0),
            'total' => (float) ($cart->grand_total ?? 0),
        ];
    }

    private function generateOrderNumber(): string
    {
        $prefix = 'ORD-' . now()->format('Ymd') . '-';
        $lastOrder = Order::where('order_number', 'like', $prefix . '%')
            ->orderBy('order_number', 'desc')
            ->first();

        if ($lastOrder) {
            $lastNumber = (int) substr($lastOrder->order_number, -5);
            $newNumber = str_pad($lastNumber + 1, 5, '0', STR_PAD_LEFT);
        } else {
            $newNumber = '00001';
        }

        return $prefix . $newNumber;
    }

    private function deductInventory($cartItem, Order $order): void
    {
        $variant = $cartItem->variant;
        $variant->decrement('stock', $cartItem->quantity);

        StockMovement::create([
            'variant_id' => $variant->id,
            'warehouse_id' => $variant->inventories()->first()?->warehouse_id,
            'type' => StockMovementType::Sale,
            'quantity' => $cartItem->quantity,
            'before_quantity' => $variant->stock + $cartItem->quantity,
            'after_quantity' => $variant->stock,
            'reference_type' => Order::class,
            'reference_id' => $order->id,
        ]);
    }
}
