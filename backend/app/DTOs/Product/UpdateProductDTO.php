<?php
declare(strict_types=1);

namespace App\DTOs\Product;

class UpdateProductDTO
{
    public function __construct(
        public readonly ?string $name = null,
        public readonly ?string $slug = null,
        public readonly ?string $brand_id = null,
        public readonly ?string $short_description = null,
        public readonly ?string $description = null,
        public readonly ?string $status = null,
        public readonly ?bool $is_featured = null,
        public readonly ?string $seo_title = null,
        public readonly ?string $seo_description = null,
        public readonly ?string $og_image = null,
        public readonly ?string $size_guide_image = null,
        public readonly ?string $gender = null,
        public readonly ?array $categories = null,
        public readonly ?array $collections = null,
        public readonly ?array $tags = null,
        public readonly ?array $variants = null,
        public readonly ?array $images = null,
        public readonly ?\DateTime $scheduled_at = null,
    ) {}

    public static function fromArray(array $data): self
    {
        return new self(
            name: $data['name'] ?? null,
            slug: $data['slug'] ?? null,
            brand_id: $data['brand_id'] ?? null,
            short_description: $data['short_description'] ?? null,
            description: $data['description'] ?? null,
            status: $data['status'] ?? null,
            is_featured: isset($data['is_featured']) ? (bool)$data['is_featured'] : null,
            seo_title: $data['seo_title'] ?? null,
            seo_description: $data['seo_description'] ?? null,
            og_image: $data['og_image'] ?? null,
            size_guide_image: $data['size_guide_image'] ?? null,
            gender: $data['gender'] ?? null,
            categories: $data['categories'] ?? null,
            collections: $data['collections'] ?? null,
            tags: $data['tags'] ?? null,
            variants: $data['variants'] ?? null,
            images: $data['images'] ?? null,
            scheduled_at: isset($data['scheduled_at']) ? new \DateTime($data['scheduled_at']) : null,
        );
    }
}
