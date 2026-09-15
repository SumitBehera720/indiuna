<?php
declare(strict_types=1);

namespace App\Actions\Product;

use App\DTOs\Product\CreateProductDTO;
use App\Models\Product;
use App\Repositories\ProductRepository;
use Illuminate\Support\Facades\DB;

class CreateProductAction
{
    public function __construct(
        private readonly ProductRepository $productRepository,
    ) {}

    public function execute(CreateProductDTO $dto): Product
    {
        return DB::transaction(function () use ($dto) {
            $product = $this->productRepository->create([
                'name' => $dto->name,
                'slug' => $dto->slug,
                'brand_id' => $dto->brand_id,
                'short_description' => $dto->short_description,
                'description' => $dto->description,
                'status' => $dto->status,
                'is_featured' => $dto->is_featured,
                'seo_title' => $dto->seo_title,
                'seo_description' => $dto->seo_description,
                'og_image' => $dto->og_image,
                'tags' => $dto->tags,
                'scheduled_at' => $dto->scheduled_at,
            ]);

            foreach ($dto->variants as $variantData) {
                $product->variants()->create($variantData);
            }

            if (!empty($dto->categories)) {
                $product->categories()->sync($dto->categories);
            }

            if (!empty($dto->collections)) {
                $product->collections()->sync($dto->collections);
            }

            foreach ($dto->images as $imageData) {
                $product->images()->create($imageData);
            }

            return $product->load(['brand', 'categories', 'collections', 'variants', 'images', 'media']);
        });
    }
}
