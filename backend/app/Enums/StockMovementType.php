<?php

namespace App\Enums;

enum StockMovementType: string
{
    case Addition = 'addition';
    case Reduction = 'reduction';
    case Transfer = 'transfer';
    case Adjustment = 'adjustment';
    case Return = 'return';
    case Sale = 'sale';
    case PurchaseOrder = 'purchase_order';

    public function label(): string
    {
        return match ($this) {
            self::Addition => 'Addition',
            self::Reduction => 'Reduction',
            self::Transfer => 'Transfer',
            self::Adjustment => 'Adjustment',
            self::Return => 'Return',
            self::Sale => 'Sale',
            self::PurchaseOrder => 'Purchase Order',
        };
    }

    public function isIncoming(): bool
    {
        return in_array($this, [self::Addition, self::Return, self::PurchaseOrder]);
    }

    public function isOutgoing(): bool
    {
        return in_array($this, [self::Reduction, self::Sale]);
    }
}
