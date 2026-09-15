<?php
declare(strict_types=1);

namespace App\DTOs\Product;

class ProductFilterDTO
{
    public function __construct(
        public readonly ?string $category_id = null,
        public readonly ?string $brand_id = null,
        public readonly ?string $status = null,
        public readonly ?string $search = null,
        public readonly ?float $price_min = null,
        public readonly ?float $price_max = null,
        public readonly ?array $tags = null,
        public readonly ?string $date_from = null,
        public readonly ?string $date_to = null,
        public readonly ?string $sort_by = 'created_at',
        public readonly ?string $sort_order = 'desc',
        public readonly ?int $per_page = 15,
    ) {}

    public static function fromArray(array $data): self
    {
        return new self(
            category_id: $data['category_id'] ?? null,
            brand_id: $data['brand_id'] ?? null,
            status: $data['status'] ?? null,
            search: $data['search'] ?? null,
            price_min: isset($data['price_min']) ? (float)$data['price_min'] : null,
            price_max: isset($data['price_max']) ? (float)$data['price_max'] : null,
            tags: $data['tags'] ?? null,
            date_from: $data['date_from'] ?? null,
            date_to: $data['date_to'] ?? null,
            sort_by: $data['sort_by'] ?? 'created_at',
            sort_order: $data['sort_order'] ?? 'desc',
            per_page: isset($data['per_page']) ? (int)$data['per_page'] : 15,
        );
    }
}
