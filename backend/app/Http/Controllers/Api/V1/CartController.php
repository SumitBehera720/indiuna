<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Cart\AddItemRequest;
use App\Http\Requests\Api\V1\Cart\ApplyCouponRequest;
use App\Http\Requests\Api\V1\Cart\UpdateItemRequest;
use App\Http\Resources\CartResource;
use App\Services\CartService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class CartController extends Controller
{
    public function __construct(
        private readonly CartService $cartService,
    ) {}

    private function getCart(Request $request)
    {
        $userId = $request->user()?->id;
        $sessionId = $request->header('X-Session-Id', $request->cookie('session_id', Str::random(40)));

        return $this->cartService->getCart($userId, $sessionId);
    }

    public function index(Request $request): JsonResponse
    {
        $cart = $this->getCart($request);

        return $this->success(new CartResource($cart));
    }

    public function addItem(AddItemRequest $request): JsonResponse
    {
        $cart = $this->getCart($request);

        $item = $this->cartService->addItem(
            $cart->id,
            $request->input('product_id'),
            $request->input('variant_id'),
            $request->input('quantity', 1)
        );

        return $this->success(new CartResource($cart->fresh()), 'Item added to cart');
    }

    public function updateItem(string $itemId, UpdateItemRequest $request): JsonResponse
    {
        $this->cartService->updateItem($itemId, $request->input('quantity'));

        return $this->success(null, 'Cart item updated');
    }

    public function removeItem(string $itemId): JsonResponse
    {
        $this->cartService->removeItem($itemId);

        return $this->success(null, 'Item removed from cart');
    }

    public function applyCoupon(ApplyCouponRequest $request): JsonResponse
    {
        $cart = $this->getCart($request);

        $cart = $this->cartService->applyCoupon($cart->id, $request->input('code'));

        return $this->success(new CartResource($cart), 'Coupon applied successfully');
    }

    public function removeCoupon(Request $request): JsonResponse
    {
        $cart = $this->getCart($request);

        $cart = $this->cartService->removeCoupon($cart->id);

        return $this->success(new CartResource($cart), 'Coupon removed');
    }

    public function clear(Request $request): JsonResponse
    {
        $cart = $this->getCart($request);

        $this->cartService->clear($cart->id);

        return $this->success(null, 'Cart cleared');
    }
}
