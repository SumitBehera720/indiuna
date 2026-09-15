<?php
declare(strict_types=1);

namespace App\DTOs\Customer;

class CustomerFilterDTO
{
    public function __construct(
        public readonly ?string $search = null,
        public readonly ?bool $is_active = null,
        public readonly ?string $date_from = null,
        public readonly ?string $date_to = null,
        public readonly ?string $sort_by = 'created_at',
        public readonly ?string $sort_order = 'desc',
        public readonly ?int $per_page = 15,
    ) {}

    public static function fromArray(array $data): self
    {
        return new self(
            search: $data['search'] ?? null,
            is_active: isset($data['is_active']) ? (bool)$data['is_active'] : null,
            date_from: $data['date_from'] ?? null,
            date_to: $data['date_to'] ?? null,
            sort_by: $data['sort_by'] ?? 'created_at',
            sort_order: $data['sort_order'] ?? 'desc',
            per_page: isset($data['per_page']) ? (int)$data['per_page'] : 15,
        );
    }
}
