<?php
declare(strict_types=1);

namespace App\Services;

use App\Contracts\Repositories\CouponRepositoryInterface;
use App\Enums\DiscountType;
use App\Exceptions\InvalidCouponException;
use App\Helpers\PriceHelper;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

class CouponService
{
    public function __construct(
        private readonly CouponRepositoryInterface $couponRepository,
    ) {}

    public function getAll(): LengthAwarePaginator
    {
        return $this->couponRepository->paginate(15);
    }

    public function getById(string $id): ?Model
    {
        return $this->couponRepository->findOrFail($id);
    }

    public function create(array $data): Model
    {
        return DB::transaction(function () use ($data) {
            return $this->couponRepository->create($data);
        });
    }

    public function update(string $id, array $data): Model
    {
        $coupon = $this->couponRepository->findOrFail($id);
        return $this->couponRepository->update($coupon, $data);
    }

    public function delete(string $id): bool
    {
        $coupon = $this->couponRepository->findOrFail($id);
        return $this->couponRepository->delete($coupon);
    }

    public function validate(string $code, ?float $orderTotal = null, ?string $customerId = null): Model
    {
        $coupon = $this->couponRepository->findByCode($code);

        if (!$coupon) {
            throw new InvalidCouponException('Coupon code does not exist');
        }

        if (!$coupon->is_active) {
            throw new InvalidCouponException('Coupon is not active');
        }

        $now = now();
        if ($coupon->starts_at && $now->lt($coupon->starts_at)) {
            throw new InvalidCouponException('Coupon is not yet valid');
        }

        if ($coupon->expires_at && $now->gt($coupon->expires_at)) {
            throw new InvalidCouponException('Coupon has expired');
        }

        if ($coupon->max_uses !== null && $coupon->used_count >= $coupon->max_uses) {
            throw new InvalidCouponException('Coupon usage limit has been reached');
        }

        if ($coupon->max_uses_per_customer !== null && $customerId) {
            $customerUsage = $this->couponRepository->getUsages($coupon->id)
                ->where('customer_id', $customerId)
                ->count();

            if ($customerUsage >= $coupon->max_uses_per_customer) {
                throw new InvalidCouponException('You have reached the usage limit for this coupon');
            }
        }

        if ($orderTotal !== null && $coupon->min_order_amount !== null && $orderTotal < $coupon->min_order_amount) {
            throw new InvalidCouponException(
                "Minimum order amount of {$coupon->min_order_amount} is required"
            );
        }

        return $coupon;
    }

    public function apply(string $code, float $orderTotal): array
    {
        $coupon = $this->validate($code, $orderTotal);

        $discount = PriceHelper::calculateDiscount(
            $orderTotal,
            $coupon->type,
            $coupon->value
        );

        if ($coupon->max_discount !== null) {
            $discount = min($discount, (float) $coupon->max_discount);
        }

        return [
            'coupon' => $coupon,
            'discount' => $discount,
        ];
    }

    public function getUsages(string $id): Collection
    {
        return $this->couponRepository->getUsages($id);
    }
}
