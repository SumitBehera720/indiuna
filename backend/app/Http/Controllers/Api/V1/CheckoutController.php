<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Checkout\CartRequest;
use App\Http\Requests\Api\V1\Checkout\CheckoutInitRequest;
use App\Http\Requests\Api\V1\Checkout\CheckoutVerifyRequest;
use App\Http\Resources\OrderResource;
use App\Services\CartService;
use App\Services\CheckoutService;
use App\Services\OrderService;
use App\Services\ShippingService;
use Illuminate\Http\JsonResponse;

class CheckoutController extends Controller
{
    public function __construct(
        private readonly CartService $cartService,
        private readonly OrderService $orderService,
        private readonly ShippingService $shippingService,
        private readonly CheckoutService $checkoutService,
    ) {}

    /**
     * Public checkout entry point (guest + authenticated customers).
     * Creates the order server-side and returns the Razorpay order payload.
     */
    public function init(CheckoutInitRequest $request): JsonResponse
    {
        try {
            $payload = $this->checkoutService->init(
                $request->validated(),
                $request->user(),
            );

            return $this->success($payload, 'Checkout initialized successfully', 201);
        } catch (\RuntimeException $e) {
            return $this->error($e->getMessage(), 400);
        }
    }

    /**
     * Confirms a Razorpay payment after client-side checkout.
     */
    public function verify(CheckoutVerifyRequest $request): JsonResponse
    {
        try {
            $order = $this->checkoutService->verify($request->validated());

            return $this->success(new OrderResource($order), 'Payment verified successfully');
        } catch (\RuntimeException $e) {
            return $this->error($e->getMessage(), 400);
        }
    }

    /**
     * Shipping options for the checkout form.
     */
    public function shippingRates(\Illuminate\Http\Request $request): JsonResponse
    {
        $request->validate([
            'items' => ['required', 'array', 'min:1', 'max:50'],
            'items.*.product_id' => ['required', 'string'],
            'items.*.variant_id' => ['required', 'string'],
            'items.*.quantity' => ['required', 'integer', 'min:1', 'max:99'],
            'postal_code' => ['required', 'string', 'max:20'],
            'cod' => ['nullable', 'boolean'],
        ]);

        try {
            $rates = $this->checkoutService->getShippingRates($request->only('items', 'postal_code', 'cod'));

            return $this->success($rates, 'Shipping rates fetched successfully');
        } catch (\RuntimeException $e) {
            return $this->error($e->getMessage(), 400);
        }
    }

    public function validate(CartRequest $request): JsonResponse
    {
        $cart = $this->cartService->getCart(
            $request->user()?->id,
            $request->header('X-Session-Id')
        );

        if (!$cart || $cart->items->isEmpty()) {
            return $this->error('Cart is empty', 400);
        }

        $errors = [];

        foreach ($cart->items as $item) {
            if ($item->variant && $item->variant->stock < $item->quantity) {
                $errors[] = "Insufficient stock for {$item->product_name} ({$item->variant_name})";
            }
        }

        if (!empty($errors)) {
            return $this->error('Cart validation failed', 400, ['stock_errors' => $errors]);
        }

        $totals = $this->cartService->calculateTotals($cart);

        return $this->success([
            'cart' => new \App\Http\Resources\CartResource($cart),
            'totals' => $totals,
        ], 'Cart validated successfully');
    }

    public function shipping(CartRequest $request): JsonResponse
    {
        $request->validate([
            'postal_code' => 'required|string',
            'weight' => 'required|numeric',
        ]);

        $cart = $this->cartService->getCart(
            $request->user()?->id,
            $request->header('X-Session-Id')
        );

        if (!$cart || $cart->items->isEmpty()) {
            return $this->error('Cart is empty', 400);
        }

        $methods = $this->shippingService->getMethods();
        $rates = [];

        foreach ($methods as $method) {
            $rate = $this->shippingService->calculateRate(
                $method->id,
                $request->input('weight'),
                $cart->subtotal,
                $request->input('postal_code')
            );

            if ($rate) {
                $rates[] = $rate;
            }
        }

        return $this->success(['shipping_rates' => $rates]);
    }
}
