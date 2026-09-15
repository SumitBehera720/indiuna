<?php
declare(strict_types=1);

namespace App\Actions\Product;

use App\DTOs\Product\UpdateProductDTO;
use App\Models\Product;
use App\Repositories\ProductRepository;
use Illuminate\Support\Facades\DB;

class UpdateProductAction
{
    public function __construct(
        private readonly ProductRepository $productRepository,
    ) {}

    public function execute(string $id, UpdateProductDTO $dto): Product
    {
        return DB::transaction(function () use ($id, $dto) {
            $product = $this->productRepository->findOrFail($id);

            $updateData = array_filter([
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
            ], fn ($value) => $value !== null);

            if (!empty($updateData)) {
                $this->productRepository->update($product, $updateData);
            }

            if ($dto->variants !== null) {
                $this->syncVariants($product, $dto->variants);
            }

            if ($dto->categories !== null) {
                $product->categories()->sync($dto->categories);
            }

            if ($dto->collections !== null) {
                $product->collections()->sync($dto->collections);
            }

            if ($dto->images !== null) {
                $this->syncImages($product, $dto->images);
            }

            activity()
                ->performedOn($product)
                ->withProperties(['updated_fields' => array_keys($updateData)])
                ->log('Product updated');

            return $product->fresh()->load(['brand', 'categories', 'collections', 'variants', 'images', 'media']);
        });
    }

    private function syncVariants(Product $product, array $variants): void
    {
        $existingIds = $product->variants()->pluck('id')->toArray();
        $incomingIds = array_filter(array_column($variants, 'id'));

        $toDelete = array_diff($existingIds, $incomingIds);
        if (!empty($toDelete)) {
            $product->variants()->whereIn('id', $toDelete)->delete();
        }

        foreach ($variants as $variantData) {
            if (isset($variantData['id']) && in_array($variantData['id'], $existingIds)) {
                $variantModel = $product->variants()->find($variantData['id']);
                if ($variantModel) {
                    $variantModel->update($variantData);
                }
            } else {
                unset($variantData['id']);
                $product->variants()->create($variantData);
            }
        }
    }

    private function syncImages(Product $product, array $images): void
    {
        $product->images()->delete();

        foreach ($images as $imageData) {
            $product->images()->create($imageData);
        }
    }
}
