<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Coupon\StoreCouponRequest;
use App\Http\Requests\Api\V1\Coupon\UpdateCouponRequest;
use App\Http\Requests\Api\V1\Coupon\ValidateCouponRequest;
use App\Http\Resources\CouponResource;
use App\Services\CouponService;
use Illuminate\Http\JsonResponse;

class CouponController extends Controller
{
    public function __construct(
        private readonly CouponService $couponService,
    ) {}

    public function index(): JsonResponse
    {
        $coupons = $this->couponService->getAll();

        return $this->paginated($coupons, CouponResource::class);
    }

    public function show(string $id): JsonResponse
    {
        $coupon = $this->couponService->getById($id);

        if (!$coupon) {
            return $this->error('Coupon not found', 404);
        }

        return $this->success(new CouponResource($coupon));
    }

    public function store(StoreCouponRequest $request): JsonResponse
    {
        $coupon = $this->couponService->create($request->validated());

        return $this->success(new CouponResource($coupon), 'Coupon created successfully', 201);
    }

    public function update(string $id, UpdateCouponRequest $request): JsonResponse
    {
        $coupon = $this->couponService->update($id, $request->validated());

        return $this->success(new CouponResource($coupon), 'Coupon updated successfully');
    }

    public function destroy(string $id): JsonResponse
    {
        $this->couponService->delete($id);

        return $this->success(null, 'Coupon deleted successfully');
    }

    public function validate(ValidateCouponRequest $request): JsonResponse
    {
        try {
            $coupon = $this->couponService->validate(
                $request->input('code'),
                $request->input('order_total'),
                $request->input('customer_id')
            );

            return $this->success(new CouponResource($coupon), 'Coupon is valid');
        } catch (\App\Exceptions\InvalidCouponException $e) {
            return $this->error($e->getMessage(), 400);
        }
    }

    public function usages(string $id): JsonResponse
    {
        $usages = $this->couponService->getUsages($id);

        return $this->success($usages);
    }
}
