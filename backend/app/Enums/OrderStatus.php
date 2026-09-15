<?php

namespace App\Enums;

enum OrderStatus: string
{
    case Pending = 'pending';
    case Confirmed = 'confirmed';
    case Processing = 'processing';
    case Shipped = 'shipped';
    case Delivered = 'delivered';
    case Cancelled = 'cancelled';
    case Returned = 'returned';
    case Refunded = 'refunded';

    public function label(): string
    {
        return match ($this) {
            self::Pending => 'Pending',
            self::Confirmed => 'Confirmed',
            self::Processing => 'Processing',
            self::Shipped => 'Shipped',
            self::Delivered => 'Delivered',
            self::Cancelled => 'Cancelled',
            self::Returned => 'Returned',
            self::Refunded => 'Refunded',
        };
    }

    public function isActive(): bool
    {
        return match ($this) {
            self::Pending, self::Confirmed, self::Processing, self::Shipped => true,
            self::Delivered, self::Cancelled, self::Returned, self::Refunded => false,
        };
    }

    public static function allowedTransitions(): array
    {
        return [
            self::Pending->value => [self::Confirmed, self::Cancelled],
            self::Confirmed->value => [self::Processing, self::Cancelled],
            self::Processing->value => [self::Shipped, self::Cancelled],
            self::Shipped->value => [self::Delivered, self::Returned],
            self::Delivered->value => [self::Returned],
            self::Cancelled->value => [],
            self::Returned->value => [self::Refunded],
            self::Refunded->value => [],
        ];
    }
}
