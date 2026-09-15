<?php
declare(strict_types=1);

namespace App\Services;

use App\Exceptions\InsufficientStockException;
use App\Exceptions\InvalidCouponException;
use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Product;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class CartService
{
    public function __construct(
        private readonly CouponService $couponService,
        private readonly TaxService $taxService,
        private readonly ShippingService $shippingService,
        private readonly ProductService $productService,
    ) {}

    public function getCart(?string $userId, ?string $sessionId): Cart
    {
        if ($userId) {
            $cart = Cart::where('user_id', $userId)
                ->where('is_active', true)
                ->with(['items.product', 'items.variant'])
                ->first();

            if (!$cart) {
                $cart = Cart::create([
                    'user_id' => $userId,
                    'session_id' => $sessionId ?? Str::random(40),
                    'is_active' => true,
                ]);
            }
        } elseif ($sessionId) {
            $cart = Cart::where('session_id', $sessionId)
                ->where('is_active', true)
                ->with(['items.product', 'items.variant'])
                ->first();

            if (!$cart) {
                $cart = Cart::create([
                    'session_id' => $sessionId,
                    'is_active' => true,
                ]);
            }
        } else {
            $cart = Cart::create([
                'session_id' => Str::random(40),
                'is_active' => true,
            ]);
        }

        $this->calculateTotals($cart);
        return $cart;
    }

    public function addItem(string $cartId, string $productId, ?string $variantId, int $quantity): CartItem
    {
        return DB::transaction(function () use ($cartId, $productId, $variantId, $quantity) {
            $cart = Cart::findOrFail($cartId);
            $product = $this->productService->getById($productId);

            if (!$product) {
                throw new \RuntimeException('Product not found');
            }

            $variant = null;
            if ($variantId) {
                $variant = $product->variants()->find($variantId);
                if (!$variant) {
                    throw new \RuntimeException('Variant not found');
                }

                if ($variant->is_tracked && $variant->stock < $quantity) {
                    throw new InsufficientStockException(
                        "Insufficient stock for variant: {$variant->sku}"
                    );
                }
            }

            $existingItem = $cart->items()
                ->where('product_id', $productId)
                ->where('variant_id', $variantId)
                ->first();

            if ($existingItem) {
                $newQuantity = $existingItem->quantity + $quantity;

                if ($variant && $variant->is_tracked && $variant->stock < $newQuantity) {
                    throw new InsufficientStockException(
                        "Insufficient stock for variant: {$variant->sku}"
                    );
                }

                $unitPrice = $variant ? (float) $variant->price : 0;
                $existingItem->update([
                    'quantity' => $newQuantity,
                    'subtotal' => $unitPrice * $newQuantity,
                    'total' => $unitPrice * $newQuantity,
                ]);

                $this->calculateTotals($cart);

                return $existingItem->fresh();
            }

            $unitPrice = $variant ? (float) $variant->price : 0;

            $item = $cart->items()->create([
                'product_id' => $productId,
                'variant_id' => $variantId,
                'product_name' => $product->name,
                'variant_name' => $variant?->name,
                'sku' => $variant?->sku,
                'quantity' => $quantity,
                'unit_price' => $unitPrice,
                'subtotal' => $unitPrice * $quantity,
                'tax_amount' => 0,
                'total' => $unitPrice * $quantity,
            ]);

            $this->calculateTotals($cart);

            return $item;
        });
    }

    public function updateItem(string $cartItemId, int $quantity): CartItem
    {
        return DB::transaction(function () use ($cartItemId, $quantity) {
            $item = CartItem::findOrFail($cartItemId);

            if ($quantity < 1) {
                $item->delete();
                $this->calculateTotals($item->cart);
                throw new \RuntimeException('Quantity must be at least 1');
            }

            if ($item->variant) {
                if ($item->variant->is_tracked && $item->variant->stock < $quantity) {
                    throw new InsufficientStockException(
                        "Insufficient stock for variant: {$item->variant->sku}"
                    );
                }
            }

            $item->update([
                'quantity' => $quantity,
                'subtotal' => $item->unit_price * $quantity,
                'total' => $item->unit_price * $quantity,
            ]);

            $this->calculateTotals($item->cart);

            return $item->fresh();
        });
    }

    public function removeItem(string $cartItemId): void
    {
        DB::transaction(function () use ($cartItemId) {
            $item = CartItem::findOrFail($cartItemId);
            $cart = $item->cart;
            $item->delete();
            $this->calculateTotals($cart);
        });
    }

    public function applyCoupon(string $cartId, string $code): Cart
    {
        return DB::transaction(function () use ($cartId, $code) {
            $cart = Cart::findOrFail($cartId);

            $result = $this->couponService->apply($code, $cart->subtotal);

            $cart->update([
                'coupon_code' => $code,
                'coupon_id' => $result['coupon']->id,
                'discount' => $result['discount'],
            ]);

            $this->incrementUsage($result['coupon']->id);

            $this->calculateTotals($cart);

            return $cart->fresh();
        });
    }

    public function removeCoupon(string $cartId): Cart
    {
        return DB::transaction(function () use ($cartId) {
            $cart = Cart::findOrFail($cartId);

            $cart->update([
                'coupon_code' => null,
                'coupon_id' => null,
                'discount' => 0,
            ]);

            $this->calculateTotals($cart);

            return $cart->fresh();
        });
    }

    public function clear(string $cartId): void
    {
        DB::transaction(function () use ($cartId) {
            $cart = Cart::findOrFail($cartId);
            $cart->items()->delete();
            $cart->update([
                'subtotal' => 0,
                'discount' => 0,
                'shipping' => 0,
                'tax' => 0,
                'total' => 0,
                'coupon_code' => null,
                'coupon_id' => null,
            ]);
        });
    }

    public function calculateTotals(?Cart $cart): array
    {
        if (!$cart) {
            return [
                'subtotal' => 0,
                'discount' => 0,
                'shipping' => 0,
                'tax' => 0,
                'total' => 0,
            ];
        }

        $cart->loadMissing('items');

        $subtotal = $cart->items->sum('total');

        $discount = (float) $cart->discount;

        $shipping = (float) $cart->shipping;

        $taxResult = $this->taxService->calculateTax(
            max($subtotal - $discount, 0),
            null,
            $cart->shipping_address?->country ?? 'IN'
        );

        $tax = $taxResult['total_tax'];

        $total = max($subtotal - $discount + $shipping + $tax, 0);

        $cart->update([
            'subtotal' => $subtotal,
            'discount' => $discount,
            'shipping' => $shipping,
            'tax' => $tax,
            'total' => $total,
        ]);

        return [
            'subtotal' => $subtotal,
            'discount' => $discount,
            'shipping' => $shipping,
            'tax' => $tax,
            'total' => $total,
        ];
    }

    private function incrementUsage(string $couponId): void
    {
        // Increment coupon usage count
        \App\Models\Coupon::where('id', $couponId)->increment('used_count');
    }
}
