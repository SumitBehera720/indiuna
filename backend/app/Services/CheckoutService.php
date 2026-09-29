<?php

declare(strict_types=1);

namespace App\Services;

use App\Contracts\Repositories\InventoryRepositoryInterface;
use App\DTOs\Inventory\StockAdjustmentDTO;
use App\Enums\OrderStatus;
use App\Enums\PaymentStatus;
use App\Enums\StockMovementType;
use App\Events\Order\OrderCreated;
use App\Exceptions\InsufficientStockException;
use App\Exceptions\InvalidCouponException;
use App\Models\Customer;
use App\Models\Order;
use App\Models\Payment;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use RuntimeException;
use Throwable;

class CheckoutService
{
    public function __construct(
        private readonly PaymentService $paymentService,
        private readonly CouponService $couponService,
        private readonly TaxService $taxService,
        private readonly ShippingService $shippingService,
        private readonly SettingsService $settings,
        private readonly InventoryRepositoryInterface $inventoryRepository,
    ) {}

    /**
     * Start a checkout: validates the basket, creates the order (pending payment)
     * and, for Razorpay, creates the payment order at the gateway.
     *
     * @return array<string, mixed>
     */
    public function init(array $data, ?User $user): array
    {
        $method = $data['payment_method'];

        if ($method === 'razorpay' && !$this->paymentService->razorpayEnabled()) {
            throw new RuntimeException('Online payments are currently disabled');
        }

        if ($method === 'cod' && !$this->paymentService->codEnabled()) {
            throw new RuntimeException('Cash on delivery is currently disabled');
        }

        $order = DB::transaction(function () use ($data, $user, $method) {
            $items = $this->resolveItems($data['items']);
            $totals = $this->calculateTotals($items, $data);

            $customer = $this->resolveCustomer($data, $user);
            $address = $data['shipping_address'];
            $billing = $data['billing_same_as_shipping'] ?? true
                ? $address
                : ($data['billing_address'] ?? $address);

            $orderNumber = 'ORD-' . strtoupper(Str::random(8)) . '-' . now()->format('YmdHis');

            $order = Order::create([
                'order_number' => $orderNumber,
                'user_id' => $user?->id,
                'customer_id' => $customer?->id,
                'status' => OrderStatus::Pending->value,
                'payment_status' => PaymentStatus::Pending->value,
                'fulfillment_status' => 'pending',
                'shipping_status' => 'pending',
                'subtotal' => $totals['subtotal'],
                'discount_total' => $totals['discount'],
                'shipping_total' => $totals['shipping'],
                'tax_total' => $totals['tax'],
                'grand_total' => $totals['total'],
                'paid_total' => 0,
                'due_total' => $totals['total'],
                'refund_total' => 0,
                'currency' => 'INR',
                'total_items' => count($items),
                'total_quantity' => array_sum(array_column($data['items'], 'quantity')),
                'coupon_code' => $totals['coupon'] ?? null,
                'coupon_discount' => $totals['discount'],
                'shipping_method' => $totals['shipping_method_code'],
                'shipping_method_name' => $totals['shipping_method_name'],
                'payment_method' => $method,
                'payment_method_name' => $method === 'razorpay' ? 'Razorpay' : 'Cash on Delivery',
                'notes' => $data['notes'] ?? null,
                'is_gift' => (bool) ($data['is_gift'] ?? false),
                'gift_message' => $data['gift_message'] ?? null,
                'billing_first_name' => $billing['first_name'],
                'billing_last_name' => $billing['last_name'] ?? '',
                'billing_address_line1' => $billing['address_line1'],
                'billing_address_line2' => $billing['address_line2'] ?? null,
                'billing_city' => $billing['city'],
                'billing_state' => $billing['state'],
                'billing_postal_code' => $billing['postal_code'],
                'billing_country' => $billing['country'] ?? 'India',
                'billing_phone' => $billing['phone'],
                'billing_email' => $billing['email'],
                'shipping_first_name' => $address['first_name'],
                'shipping_last_name' => $address['last_name'] ?? '',
                'shipping_address_line1' => $address['address_line1'],
                'shipping_address_line2' => $address['address_line2'] ?? null,
                'shipping_city' => $address['city'],
                'shipping_state' => $address['state'],
                'shipping_postal_code' => $address['postal_code'],
                'shipping_country' => $address['country'] ?? 'India',
                'shipping_phone' => $address['phone'],
                'shipping_email' => $address['email'],
                'ip_address' => request()->ip(),
                'user_agent' => Str::limit(request()->userAgent() ?? '', 500),
                'source' => 'storefront',
                'channel' => 'web',
            ]);

            foreach ($items as $item) {
                $order->items()->create([
                    'product_id' => $item['variant']->product_id,
                    'variant_id' => $item['variant']->id,
                    'product_name' => $item['product']->name,
                    'product_sku' => $item['variant']->sku,
                    'variant_label' => $item['variant']->name,
                    'unit_price' => $item['variant']->price,
                    'quantity' => $item['quantity'],
                    'subtotal' => $item['subtotal'],
                    'discount_total' => 0,
                    'tax_total' => 0,
                    'shipping_total' => 0,
                    'grand_total' => $item['subtotal'],
                    'meta_data' => $item['meta_data'] ?? null,
                ]);
            }

            $order->timeline()->create([
                'status' => OrderStatus::Pending->value,
                'notes' => 'Order placed successfully',
            ]);

            $payment = $order->payments()->create([
                'payment_method' => $method,
                'payment_method_name' => $method === 'razorpay' ? 'Razorpay' : 'Cash on Delivery',
                'status' => PaymentStatus::Pending->value,
                'amount' => $totals['total'],
                'fee' => 0,
                'net_amount' => $totals['total'],
                'currency' => 'INR',
                'payer_name' => $address['first_name'] . ' ' . ($address['last_name'] ?? ''),
                'payer_email' => $address['email'] ?? null,
                'payer_phone' => $address['phone'] ?? null,
            ]);

            if ($method === 'razorpay') {
                $gatewayOrder = $this->paymentService->createRazorpayOrder(
                    $order->order_number,
                    (int) round($totals['total'] * 100)
                );

                $payment->update([
                    'gateway_response' => [
                        'gateway' => 'razorpay',
                        'razorpay_order_id' => $gatewayOrder['id'],
                    ],
                ]);
            } else {
                // COD: mark order as confirmed immediately
                $payment->update([
                    'gateway_response' => ['gateway' => 'cod'],
                    'status' => PaymentStatus::Completed->value,
                    'paid_at' => now(),
                ]);

                $order->update([
                    'status' => OrderStatus::Confirmed->value,
                    'payment_status' => PaymentStatus::Completed->value,
                    'paid_total' => $order->grand_total,
                    'due_total' => 0,
                ]);

                $order->timeline()->create([
                    'status' => OrderStatus::Confirmed->value,
                    'notes' => 'Order confirmed — Cash on Delivery',
                ]);

                if ($order->coupon_code) {
                    \App\Models\Coupon::where('code', $order->coupon_code)->increment('used_count');
                }

                $customer = $order->customer;
                if ($customer) {
                    $customer->increment('total_orders');
                    $customer->increment('total_spent', (float) $order->grand_total);
                    $customer->update(['last_purchased_at' => now()]);
                }

                $this->processStockReductionAndAlert($order);
                $this->sendOrderConfirmationEmail($order);
            }

            return $order->fresh(['items', 'payments']);
        });

        $payment = $order->payments->first();

        $payload = [
            'order_id' => $order->id,
            'order_number' => $order->order_number,
            'amount_paise' => (int) round($order->grand_total * 100),
            'currency' => 'INR',
            'payment_method' => $method,
        ];

        if ($method === 'razorpay') {
            $payload['razorpay_order_id'] = $payment->gateway_response['razorpay_order_id'];
            $payload['key_id'] = $this->paymentService->razorpayKeyId();
        }

        OrderCreated::dispatch($order);

        return $payload;
    }

    /**
     * Create a new Razorpay order for an existing pending order (payment retry).
     *
     * @return array<string, mixed>
     */
    public function createRetryPayment(Order $order): array
    {
        if (!$this->paymentService->razorpayEnabled()) {
            throw new RuntimeException('Online payments are currently disabled');
        }

        // Get existing pending payment or create a fresh one
        $payment = $order->payments()
            ->where('status', PaymentStatus::Pending->value)
            ->where('payment_method', 'razorpay')
            ->first();

        // Create a new Razorpay order for the same amount
        $gatewayOrder = $this->paymentService->createRazorpayOrder(
            $order->order_number,
            (int) round($order->grand_total * 100)
        );

        if ($payment) {
            $payment->update([
                'gateway_response' => [
                    'gateway' => 'razorpay',
                    'razorpay_order_id' => $gatewayOrder['id'],
                ],
            ]);
        } else {
            $payment = $order->payments()->create([
                'payment_method'      => 'razorpay',
                'payment_method_name' => 'Razorpay',
                'status'              => PaymentStatus::Pending->value,
                'amount'              => $order->grand_total,
                'fee'                 => 0,
                'net_amount'          => $order->grand_total,
                'currency'            => 'INR',
                'gateway_response'    => [
                    'gateway'          => 'razorpay',
                    'razorpay_order_id' => $gatewayOrder['id'],
                ],
            ]);
        }

        return [
            'order_id'          => $order->id,
            'order_number'      => $order->order_number,
            'amount_paise'      => (int) round($order->grand_total * 100),
            'currency'          => 'INR',
            'payment_method'    => 'razorpay',
            'razorpay_order_id' => $gatewayOrder['id'],
            'key_id'            => $this->paymentService->razorpayKeyId(),
        ];
    }

    /**
     * Confirm a Razorpay payment after the client-side checkout handler runs.
     */
    public function verify(array $data): Order
    {
        $order = Order::with(['items', 'payments'])->findOrFail($data['order_id']);

        $payment = $order->payments()
            ->where('status', PaymentStatus::Pending->value)
            ->first();

        if (!$payment) {
            throw new RuntimeException('No pending payment found for this order');
        }

        $gatewayOrderId = $payment->gateway_response['razorpay_order_id'] ?? null;

        if ($gatewayOrderId === null || $gatewayOrderId !== $data['razorpay_order_id']) {
            throw new RuntimeException('Payment order mismatch');
        }

        if (!$this->paymentService->verifySignature(
            $data['razorpay_order_id'],
            $data['razorpay_payment_id'],
            $data['razorpay_signature'],
        )) {
            Log::error('Razorpay signature verification failed', [
                'order_id' => $order->id,
                'payment_id' => $data['razorpay_payment_id'],
            ]);

            throw new RuntimeException('Payment verification failed');
        }

        return DB::transaction(function () use ($order, $payment, $data) {
            $this->settlePayment(
                $payment,
                $data['razorpay_payment_id'],
                (int) round($payment->amount * 100)
            );

            return $order->fresh(['items', 'payments', 'customer']);
        });
    }

    /**
     * Settle a pending payment (shared by the verify endpoint and the webhook).
     */
    public function settlePayment(Payment $payment, string $razorpayPaymentId, int $amountPaise): void
    {
        $expectedPaise = (int) round($payment->amount * 100);

        if ($amountPaise !== $expectedPaise) {
            Log::error('Razorpay payment amount mismatch', [
                'payment_id' => $payment->id,
                'expected' => $expectedPaise,
                'received' => $amountPaise,
            ]);

            throw new RuntimeException('Payment amount mismatch');
        }

        $order = $payment->order;

        $payment->update([
            'status' => PaymentStatus::Completed->value,
            'transaction_id' => $razorpayPaymentId,
            'paid_at' => now(),
            'gateway_response' => array_merge($payment->gateway_response ?? [], [
                'razorpay_payment_id' => $razorpayPaymentId,
                'settled_at' => now()->toIso8601String(),
            ]),
        ]);

        $order->update([
            'payment_status' => PaymentStatus::Completed->value,
            'paid_total' => $payment->amount,
            'due_total' => max($order->grand_total - $payment->amount, 0),
            'paid_at' => now(),
        ]);

        $this->processStockReductionAndAlert($order);
        $this->sendOrderConfirmationEmail($order);

        if ($order->coupon_code) {
            \App\Models\Coupon::where('code', $order->coupon_code)->increment('used_count');
        }

        $order->timeline()->create([
            'status' => $order->status->value,
            'notes' => "Payment of ₹{$payment->amount} received via Razorpay ({$razorpayPaymentId})",
        ]);

        $customer = $order->customer;
        if ($customer) {
            $customer->increment('total_orders');
            $customer->increment('total_spent', (float) $payment->amount);
            $customer->update(['last_purchased_at' => now()]);
        }
    }

    private function processStockReductionAndAlert(Order $order): void
    {
        foreach ($order->items as $item) {
            if (!$item->variant_id) {
                continue;
            }

            try {
                $this->inventoryRepository->adjustStock(new StockAdjustmentDTO(
                    variant_id: $item->variant_id,
                    warehouse_id: $this->getDefaultWarehouse(),
                    quantity: $item->quantity,
                    type: StockMovementType::Sale,
                    reason: "Order #{$order->order_number}",
                    reference_type: 'order',
                    reference_id: $order->id,
                ));
            } catch (\Throwable $e) {
                Log::warning('Stock adjustment failed', ['error' => $e->getMessage()]);
            }

            $variant = ProductVariant::with('product')->find($item->variant_id);
            if ($variant) {
                $variant->decrement('stock', $item->quantity);
                $remainingStock = (int) $variant->fresh()->stock;

                if ($remainingStock <= 0) {
                    $adminEmail = config('mail.from.address', 'support@indiuna.com');
                    try {
                        \Illuminate\Support\Facades\Mail::to($adminEmail)->send(
                            new \App\Mail\Inventory\OutOfStockAlertEmail(
                                productName: $variant->product->name ?? 'Product',
                                variantName: $variant->name ?? 'Default',
                                sku: $variant->sku ?? 'N/A'
                            )
                        );
                    } catch (\Throwable $e) {
                        Log::error('Failed to send OutOfStockAlertEmail', ['error' => $e->getMessage()]);
                    }
                }
            }
        }
    }

    private function sendOrderConfirmationEmail(Order $order): void
    {
        $recipientEmail = $order->shipping_email ?? $order->billing_email;
        if ($recipientEmail) {
            try {
                \Illuminate\Support\Facades\Mail::to($recipientEmail)->send(
                    new \App\Mail\Order\OrderConfirmationEmail($order)
                );
            } catch (\Throwable $e) {
                Log::error('Failed to send OrderConfirmationEmail', [
                    'order_id' => $order->id,
                    'email' => $recipientEmail,
                    'error' => $e->getMessage(),
                ]);
            }
        }
    }

    /**
     * Shipping options for the checkout form (live Shiprocket rates + fallback).
     *
     * @return array<string, mixed>
     */
    public function getShippingRates(array $data): array
    {
        return [
            'source' => 'default',
            'rates' => [
                [
                    'code' => 'free',
                    'name' => 'Free Shipping',
                    'cost' => 0.0,
                    'estimated_delivery_days' => '5-7',
                    'rto_charges' => 0.0,
                ]
            ]
        ];
    }

    /**
     * @return array<int, array{product: Product, variant: ProductVariant, quantity: int, unit_price: float, subtotal: float}>
     */
    private function resolveItems(array $requestItems): array
    {
        $items = [];

        foreach ($requestItems as $requestItem) {
            $product = Product::where('id', $requestItem['product_id'])->first();

            if (!$product || !$product->status->isVisible()) {
                throw new RuntimeException('Product not available');
            }

            $variant = ProductVariant::where('id', $requestItem['variant_id'])
                ->where('product_id', $product->id)
                ->first();

            if (!$variant || !$variant->is_active) {
                throw new RuntimeException('Product variant not available');
            }

            $quantity = (int) $requestItem['quantity'];

            if ($variant->is_tracked && $variant->stock < $quantity) {
                throw new InsufficientStockException(
                    "Insufficient stock for {$product->name} ({$variant->name})"
                );
            }

            $items[] = [
                'product' => $product,
                'variant' => $variant,
                'quantity' => $quantity,
                'unit_price' => (float) $variant->price,
                'subtotal' => round((float) $variant->price * $quantity, 2),
                'meta_data' => $requestItem['meta_data'] ?? $requestItem['custom_options'] ?? $requestItem['customOptions'] ?? null,
            ];
        }

        if (empty($items)) {
            throw new RuntimeException('Cart is empty');
        }

        return $items;
    }

    /**
     * @param array<int, array{product: Product, variant: ProductVariant, quantity: int, unit_price: float, subtotal: float}> $items
     * @return array<string, mixed>
     */
    private function calculateTotals(array $items, array $data): array
    {
        $subtotal = (float) array_sum(array_column($items, 'subtotal'));
        $discount = 0.0;
        $couponCode = null;

        if (!empty($data['coupon_code'])) {
            try {
                $result = $this->couponService->apply($data['coupon_code'], $subtotal);
                $discount = (float) $result['discount'];
                $couponCode = $data['coupon_code'];
            } catch (InvalidCouponException $e) {
                Log::info('Coupon rejected at checkout', ['code' => $data['coupon_code'], 'reason' => $e->getMessage()]);
            }
        }

        $shipping = [
            'code'                => 'free',
            'name'                => 'Free Shipping',
            'cost'                => 0.0,
            'estimated_days_min'  => 5,
            'estimated_days_max'  => 7,
        ];

        $taxResult = $this->taxService->calculateTax(
            max($subtotal - $discount, 0),
            null,
            $data['shipping_address']['country'] ?? 'IN',
        );

        // Treat GST/tax as inclusive of product price to align remote DB with storefront
        $taxRateDecimal = 0.18; // default fallback 18%
        if (!empty($taxResult['tax_breakdown'])) {
            $taxRateDecimal = array_sum(array_column($taxResult['tax_breakdown'], 'rate')) / 100;
        }
        $taxInclusiveAmount = round(max($subtotal - $discount, 0) * ($taxRateDecimal / (1 + $taxRateDecimal)), 2);

        $total = round(max($subtotal - $discount + $shipping['cost'], 0), 2);

        return [
            'subtotal' => $subtotal,
            'discount' => $discount,
            'shipping' => $shipping['cost'],
            'tax' => $taxInclusiveAmount,
            'total' => $total,
            'coupon' => $couponCode,
            'shipping_method_code' => $shipping['code'],
            'shipping_method_name' => $shipping['name'],
        ];
    }

    private function resolveCustomer(array $data, ?User $user): ?Customer
    {
        $email = $data['shipping_address']['email'] ?? null;

        if (!$email) {
            return null;
        }

        $customer = Customer::where('email', $email)->first();

        if (!$customer) {
            try {
                $customer = Customer::create([
                    'user_id' => $user?->id,
                    'first_name' => $data['shipping_address']['first_name'],
                    'last_name' => $data['shipping_address']['last_name'] ?? '',
                    'email' => $email,
                    'phone' => $data['shipping_address']['phone'] ?? null,
                ]);
            } catch (Throwable $e) {
                Log::warning('Customer creation failed during checkout', ['error' => $e->getMessage()]);

                return null;
            }
        } elseif ($user && !$customer->user_id) {
            $customer->update(['user_id' => $user->id]);
        }

        if ($customer && !empty($data['shipping_address'])) {
            try {
                $addr = $data['shipping_address'];
                $postalCode = $addr['postal_code'] ?? $addr['pincode'] ?? '';
                $line1 = $addr['address_line1'] ?? '';

                if ($line1) {
                    $exists = \App\Models\CustomerAddress::where('customer_id', $customer->id)
                        ->where('address_line1', $line1)
                        ->where('postal_code', $postalCode)
                        ->exists();

                    if (!$exists) {
                        $hasDefault = \App\Models\CustomerAddress::where('customer_id', $customer->id)
                            ->where('is_default', true)
                            ->exists();

                        \App\Models\CustomerAddress::create([
                            'customer_id' => $customer->id,
                            'type' => 'both',
                            'first_name' => $addr['first_name'] ?? $customer->first_name ?? 'Customer',
                            'last_name' => $addr['last_name'] ?? $customer->last_name ?? '',
                            'company' => $addr['company'] ?? null,
                            'address_line1' => $line1,
                            'address_line2' => $addr['address_line2'] ?? null,
                            'city' => $addr['city'] ?? '',
                            'state' => $addr['state'] ?? '',
                            'postal_code' => $postalCode,
                            'country' => $addr['country'] ?? 'India',
                            'phone' => $addr['phone'] ?? null,
                            'is_default' => !$hasDefault,
                        ]);
                    }
                }
            } catch (Throwable $e) {
                Log::warning('Auto-saving customer address failed during checkout', ['error' => $e->getMessage()]);
            }
        }

        return $customer;
    }

    private function getDefaultWarehouse(): ?string
    {
        $warehouse = \App\Models\Warehouse::where('is_active', true)
            ->where('is_primary', true)
            ->first() ?? \App\Models\Warehouse::where('is_active', true)->first();

        if (!$warehouse) {
            $warehouse = \App\Models\Warehouse::create([
                'name' => 'Primary Warehouse',
                'code' => 'MAIN-' . Str::random(4),
                'address_line1' => 'Default address',
                'city' => 'Mumbai',
                'state' => 'Maharashtra',
                'postal_code' => '400001',
                'country' => 'India',
                'is_active' => true,
                'is_primary' => true,
            ]);
        }

        return $warehouse->id;
    }
}
