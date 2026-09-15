<?php

namespace App\Enums;

enum DiscountType: string
{
    case Percentage = 'percentage';
    case FixedAmount = 'fixed_amount';
    case FreeShipping = 'free_shipping';
    case BuyXGetY = 'buy_x_get_y';

    public function label(): string
    {
        return match ($this) {
            self::Percentage => 'Percentage',
            self::FixedAmount => 'Fixed Amount',
            self::FreeShipping => 'Free Shipping',
            self::BuyXGetY => 'Buy X Get Y',
        };
    }

    public function requiresValue(): bool
    {
        return match ($this) {
            self::Percentage, self::FixedAmount => true,
            self::FreeShipping, self::BuyXGetY => false,
        };
    }
}
