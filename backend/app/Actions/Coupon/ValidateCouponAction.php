<?php
declare(strict_types=1);

namespace App\Actions\Coupon;

use App\Enums\DiscountType;
use App\Models\Coupon;
use App\Exceptions\InvalidCouponException;

class ValidateCouponAction
{
    public function execute(string $code, float $orderTotal, ?string $customerId = null): array
    {
        $coupon = Coupon::where('code', $code)->first();

        if (!$coupon) {
            throw new InvalidCouponException('Coupon not found');
        }

        if (!$coupon->is_active) {
            throw new InvalidCouponException('Coupon is inactive');
        }

        $now = now();
        if ($coupon->starts_at && $now->lt($coupon->starts_at)) {
            throw new InvalidCouponException('Coupon is not yet valid');
        }

        if ($coupon->expires_at && $now->gt($coupon->expires_at)) {
            throw new InvalidCouponException('Coupon has expired');
        }

        if ($coupon->usage_limit && $coupon->total_used >= $coupon->usage_limit) {
            throw new InvalidCouponException('Coupon usage limit reached');
        }

        if ($customerId && $coupon->usage_limit_per_user) {
            $userUsageCount = $coupon->usages()
                ->where('customer_id', $customerId)
                ->count();

            if ($userUsageCount >= $coupon->usage_limit_per_user) {
                throw new InvalidCouponException('Coupon usage limit per user reached');
            }
        }

        if ($coupon->min_order_amount && $orderTotal < (float) $coupon->min_order_amount) {
            throw new InvalidCouponException(
                "Minimum order amount of {$coupon->min_order_amount} required"
            );
        }

        $discountAmount = $this->calculateDiscount($coupon, $orderTotal);

        return [
            'coupon' => $coupon,
            'discount_amount' => $discountAmount,
            'type' => $coupon->type,
            'code' => $coupon->code,
            'description' => $coupon->description,
        ];
    }

    private function calculateDiscount(Coupon $coupon, float $orderTotal): float
    {
        $type = DiscountType::tryFrom($coupon->type);

        return match ($type) {
            DiscountType::Percentage => min(
                $orderTotal * ((float) $coupon->value / 100),
                (float) ($coupon->max_discount_amount ?? $orderTotal)
            ),
            DiscountType::FixedAmount => min((float) $coupon->value, $orderTotal),
            DiscountType::FreeShipping => 0.0,
            DiscountType::BuyXGetY => 0.0,
            default => 0.0,
        };
    }
}
