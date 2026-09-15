<?php
declare(strict_types=1);

namespace App\Rules;

use App\Models\Coupon;
use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

class ValidCoupon implements ValidationRule
{
    public function __construct(
        private readonly ?string $customerId = null,
    ) {}

    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        $coupon = Coupon::where('code', $value)->first();

        if (!$coupon) {
            $fail('The coupon code does not exist.');
            return;
        }

        if (!$coupon->is_active) {
            $fail('This coupon code is no longer active.');
            return;
        }

        if ($coupon->expires_at && $coupon->expires_at->isPast()) {
            $fail('This coupon code has expired.');
            return;
        }

        if ($coupon->starts_at && $coupon->starts_at->isFuture()) {
            $fail('This coupon code is not yet available.');
            return;
        }

        if ($coupon->usage_limit && $coupon->total_used >= $coupon->usage_limit) {
            $fail('This coupon code has reached its usage limit.');
            return;
        }

        if ($this->customerId && $coupon->usage_limit_per_user) {
            $usageCount = $coupon->usages()->where('customer_id', $this->customerId)->count();
            if ($usageCount >= $coupon->usage_limit_per_user) {
                $fail('You have already used this coupon code the maximum number of times.');
            }
        }
    }
}
