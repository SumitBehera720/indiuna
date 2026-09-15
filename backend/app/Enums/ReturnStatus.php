<?php

namespace App\Enums;

enum ReturnStatus: string
{
    case Requested = 'requested';
    case Approved = 'approved';
    case PickedUp = 'picked_up';
    case Inspected = 'inspected';
    case Refunded = 'refunded';
    case Rejected = 'rejected';
    case Cancelled = 'cancelled';

    public function label(): string
    {
        return match ($this) {
            self::Requested => 'Requested',
            self::Approved => 'Approved',
            self::PickedUp => 'Picked Up',
            self::Inspected => 'Inspected',
            self::Refunded => 'Refunded',
            self::Rejected => 'Rejected',
            self::Cancelled => 'Cancelled',
        };
    }

    public function isResolved(): bool
    {
        return in_array($this, [self::Refunded, self::Rejected, self::Cancelled]);
    }
}
