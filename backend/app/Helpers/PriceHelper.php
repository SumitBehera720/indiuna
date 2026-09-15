<?php

namespace App\Helpers;

use App\Enums\DiscountType;

class PriceHelper
{
    public static function format(float|int $amount, string $currency = 'INR'): string
    {
        $symbols = [
            'INR' => '₹',
            'USD' => '$',
            'EUR' => '€',
            'GBP' => '£',
            'AUD' => 'A$',
            'CAD' => 'C$',
        ];

        $symbol = $symbols[$currency] ?? $currency . ' ';
        $formatted = number_format($amount, 2, '.', ',');

        return $symbol . $formatted;
    }

    public static function convertToCents(float|int $amount): int
    {
        return (int) round($amount * 100);
    }

    public static function calculateTax(float|int $amount, float $rate): float
    {
        return round($amount * ($rate / 100), 2);
    }

    public static function calculateDiscount(float|int $amount, DiscountType|string $type, float|int $value): float
    {
        if (is_string($type)) {
            $type = DiscountType::from($type);
        }

        return match ($type) {
            DiscountType::Percentage => round($amount * ($value / 100), 2),
            DiscountType::FixedAmount => min((float) $value, (float) $amount),
            DiscountType::FreeShipping => 0.0,
            DiscountType::BuyXGetY => 0.0,
        };
    }
}
