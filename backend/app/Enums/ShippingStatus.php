<?php

namespace App\Enums;

enum ShippingStatus: string
{
    case Pending = 'pending';
    case Processing = 'processing';
    case Shipped = 'shipped';
    case InTransit = 'in_transit';
    case OutForDelivery = 'out_for_delivery';
    case Delivered = 'delivered';
    case Failed = 'failed';
    case Returned = 'returned';

    public function label(): string
    {
        return match ($this) {
            self::Pending => 'Pending',
            self::Processing => 'Processing',
            self::Shipped => 'Shipped',
            self::InTransit => 'In Transit',
            self::OutForDelivery => 'Out for Delivery',
            self::Delivered => 'Delivered',
            self::Failed => 'Failed',
            self::Returned => 'Returned',
        };
    }

    public function isDelivered(): bool
    {
        return $this === self::Delivered;
    }

    public function isInTransit(): bool
    {
        return in_array($this, [self::Shipped, self::InTransit, self::OutForDelivery]);
    }
}
