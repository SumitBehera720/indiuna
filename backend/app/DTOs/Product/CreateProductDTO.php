<?php
declare(strict_types=1);

namespace App\DTOs\Product;

class CreateProductDTO
{
    public function __construct(
        public readonly string $name,
        public readonly string $slug,
        public readonly ?string $brand_id,
        public readonly ?string $short_description,
        public readonly ?string $description,
        public readonly string $status = 'draft',
        public readonly bool $is_featured = false,
        public readonly ?string $seo_title = null,
        public readonly ?string $seo_description = null,
        public readonly ?string $og_image = null,
        public readonly ?string $size_guide_image = null,
        public readonly ?string $gender = 'unisex',
        public readonly array $categories = [],
        public readonly array $collections = [],
        public readonly array $tags = [],
        public readonly array $variants = [],
        public readonly array $images = [],
        public readonly ?\DateTime $scheduled_at = null,
    ) {}

    public static function fromArray(array $data): self
    {
        return new self(
            name: $data['name'],
            slug: $data['slug'],
            brand_id: $data['brand_id'] ?? null,
            short_description: $data['short_description'] ?? null,
            description: $data['description'] ?? null,
            status: $data['status'] ?? 'draft',
            is_featured: (bool)($data['is_featured'] ?? false),
            seo_title: $data['seo_title'] ?? null,
            seo_description: $data['seo_description'] ?? null,
            og_image: $data['og_image'] ?? null,
            size_guide_image: $data['size_guide_image'] ?? null,
            gender: $data['gender'] ?? 'unisex',
            categories: $data['categories'] ?? [],
            collections: $data['collections'] ?? [],
            tags: $data['tags'] ?? [],
            variants: $data['variants'] ?? [],
            images: $data['images'] ?? [],
            scheduled_at: isset($data['scheduled_at']) ? new \DateTime($data['scheduled_at']) : null,
        );
    }
}
