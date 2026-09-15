<?php
declare(strict_types=1);

namespace App\DTOs\Inventory;

use App\Enums\StockMovementType;

class StockFilterDTO
{
    public function __construct(
        public readonly ?string $variant_id = null,
        public readonly ?string $warehouse_id = null,
        public readonly ?StockMovementType $type = null,
        public readonly ?string $date_from = null,
        public readonly ?string $date_to = null,
    ) {}

    public static function fromArray(array $data): self
    {
        return new self(
            variant_id: $data['variant_id'] ?? null,
            warehouse_id: $data['warehouse_id'] ?? null,
            type: isset($data['type']) ? ($data['type'] instanceof StockMovementType ? $data['type'] : StockMovementType::from($data['type'])) : null,
            date_from: $data['date_from'] ?? null,
            date_to: $data['date_to'] ?? null,
        );
    }
}
