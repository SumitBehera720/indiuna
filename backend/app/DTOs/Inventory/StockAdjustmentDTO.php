<?php
declare(strict_types=1);

namespace App\DTOs\Inventory;

use App\Enums\StockMovementType;

class StockAdjustmentDTO
{
    public function __construct(
        public readonly string $variant_id,
        public readonly string $warehouse_id,
        public readonly int $quantity,
        public readonly StockMovementType $type,
        public readonly ?string $reason = null,
        public readonly ?string $reference_type = null,
        public readonly ?string $reference_id = null,
        public readonly ?string $notes = null,
    ) {}

    public static function fromArray(array $data): self
    {
        return new self(
            variant_id: $data['variant_id'],
            warehouse_id: $data['warehouse_id'],
            quantity: (int)$data['quantity'],
            type: $data['type'] instanceof StockMovementType ? $data['type'] : StockMovementType::from($data['type']),
            reason: $data['reason'] ?? null,
            reference_type: $data['reference_type'] ?? null,
            reference_id: $data['reference_id'] ?? null,
            notes: $data['notes'] ?? null,
        );
    }
}
