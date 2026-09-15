<?php
declare(strict_types=1);

namespace App\Services;

use App\Contracts\Repositories\ProductRepositoryInterface;
use App\Contracts\Repositories\AuditLogRepositoryInterface;
use App\DTOs\Product\CreateProductDTO;
use App\DTOs\Product\ProductFilterDTO;
use App\DTOs\Product\UpdateProductDTO;
use App\Enums\ProductStatus;
use App\Exceptions\InsufficientStockException;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class ProductService
{
    public function __construct(
        private readonly ProductRepositoryInterface $productRepository,
        private readonly AuditLogRepositoryInterface $auditLogRepository,
    ) {}

    public function getAll(ProductFilterDTO $filters): LengthAwarePaginator
    {
        return $this->productRepository->getFiltered($filters);
    }

    public function getById(string $id): ?Model
    {
        return $this->productRepository->findWithRelations($id);
    }

    public function getBySlug(string $slug): ?Model
    {
        return $this->productRepository->findBySlug($slug);
    }

    public function create(CreateProductDTO $dto): Model
    {
        return DB::transaction(function () use ($dto) {
            $product = $this->productRepository->create([
                'name' => $dto->name,
                'slug' => $dto->slug,
                'brand_id' => $dto->brand_id,
                'short_description' => $dto->short_description,
                'description' => $dto->description,
                'status' => $dto->status,
                'gender' => $dto->gender ?? 'unisex',
                'is_featured' => $dto->is_featured,
                'seo_title' => $dto->seo_title,
                'seo_description' => $dto->seo_description,
                'og_image' => $dto->og_image,
                'size_guide_image' => $dto->size_guide_image,
                'scheduled_at' => $dto->scheduled_at,
                'tags' => $dto->tags,
            ]);

            if (!empty($dto->categories)) {
                $product->categories()->sync($dto->categories);
            }

            if (!empty($dto->variants)) {
                foreach ($dto->variants as $variantData) {
                    $product->variants()->create($variantData);
                }
            }

            if (!empty($dto->images)) {
                foreach ($dto->images as $imageData) {
                    $product->images()->create($imageData);
                }
            }

            return $product->load(['categories', 'variants', 'images', 'brand']);
        });
    }

    public function update(string $id, UpdateProductDTO $dto): Model
    {
        return DB::transaction(function () use ($id, $dto) {
            $product = $this->productRepository->findOrFail($id);
            $product->load('variants');
            $previousStock = $product->variants->sum('stock');
            $original = $product->toArray();

            $updateData = array_filter([
                'name' => $dto->name,
                'slug' => $dto->slug,
                'brand_id' => $dto->brand_id,
                'short_description' => $dto->short_description,
                'description' => $dto->description,
                'status' => $dto->status,
                'gender' => $dto->gender,
                'is_featured' => $dto->is_featured,
                'seo_title' => $dto->seo_title,
                'seo_description' => $dto->seo_description,
                'og_image' => $dto->og_image,
                'size_guide_image' => $dto->size_guide_image,
                'scheduled_at' => $dto->scheduled_at,
                'tags' => $dto->tags,
            ], fn ($value) => $value !== null);

            if (!empty($updateData)) {
                $this->productRepository->update($product, $updateData);
            }

            if ($dto->categories !== null) {
                $product->categories()->sync($dto->categories);
            }

            if ($dto->variants !== null) {
                $incomingSkus = collect($dto->variants)->pluck('sku')->toArray();
                $existingVariants = $product->variants()->withTrashed()->get();

                foreach ($dto->variants as $variantData) {
                    $sku = $variantData['sku'];
                    $existingVariant = $existingVariants->where('sku', $sku)->first();

                    if ($existingVariant) {
                        if ($existingVariant->trashed()) {
                            $existingVariant->restore();
                        }
                        $existingVariant->update($variantData);
                    } else {
                        \App\Models\ProductVariant::where('sku', $sku)->onlyTrashed()->forceDelete();
                        $product->variants()->create($variantData);
                    }
                }

                $product->variants()->whereNotIn('sku', $incomingSkus)->delete();
            }

            if ($dto->images !== null) {
                $product->images()->delete();
                foreach ($dto->images as $imageData) {
                    $product->images()->create($imageData);
                }
            }

            $freshProduct = $product->fresh()->load(['categories', 'variants', 'images', 'brand']);
            $newStock = $freshProduct->variants->sum('stock');

            // Trigger back in stock emails if product was restocked
            if ($previousStock <= 0 && $newStock > 0) {
                $this->triggerBackInStockNotifications($freshProduct);
            }

            $changes = [];
            $freshArray = $freshProduct->toArray();
            foreach ($freshArray as $key => $value) {
                $originalValue = $original[$key] ?? null;

                if ($value === null && $originalValue === null) {
                    continue;
                }

                if (($value === null && $originalValue !== null) || ($value !== null && $originalValue === null)) {
                    $changes[$key] = $value;
                    continue;
                }

                $valStr = (is_array($value) || is_object($value)) ? json_encode($value) : (string) $value;
                $origStr = (is_array($originalValue) || is_object($originalValue)) ? json_encode($originalValue) : (string) $originalValue;

                if ($valStr !== $origStr) {
                    $changes[$key] = $value;
                }
            }
            if (!empty($changes)) {
                $this->auditLogRepository->create([
                    'actor_type' => 'user',
                    'actor_id' => auth()->id(),
                    'action' => 'product.updated',
                    'target_type' => 'product',
                    'target_id' => $id,
                    'changes' => $changes,
                ]);
            }

            return $freshProduct;
        });
    }

    private function triggerBackInStockNotifications(Model $product): void
    {
        try {
            $subscriptions = \App\Models\BackInStockSubscription::where('product_id', $product->id)
                ->whereNull('notified_at')
                ->get();

            foreach ($subscriptions as $sub) {
                try {
                    \Illuminate\Support\Facades\Mail::to($sub->email)->send(
                        new \App\Mail\ProductBackInStockEmail($product)
                    );
                    $sub->update(['notified_at' => now()]);
                } catch (\Throwable $e) {
                    Log::error('Failed to send back-in-stock email to subscriber', [
                        'email' => $sub->email,
                        'product_id' => $product->id,
                        'error' => $e->getMessage(),
                    ]);
                }
            }
        } catch (\Throwable $e) {
            Log::error('Failed to query back-in-stock subscriptions', ['error' => $e->getMessage()]);
        }
    }

    public function delete(string $id): bool
    {
        $product = $this->productRepository->findOrFail($id);
        return $this->productRepository->delete($product);
    }

    public function restore(string $id): bool
    {
        $product = $this->productRepository->findWithTrashed($id);
        if (!$product) {
            throw new \Illuminate\Database\Eloquent\ModelNotFoundException("Product not found with ID: {$id}");
        }
        return $this->productRepository->restore($product);
    }

    public function duplicate(string $id): Model
    {
        return DB::transaction(function () use ($id) {
            $product = $this->productRepository->findWithRelations($id);

            $copy = $this->productRepository->create([
                'name' => $product->name . ' (Copy)',
                'slug' => $product->slug . '-copy-' . Str::random(4),
                'brand_id' => $product->brand_id,
                'short_description' => $product->short_description,
                'description' => $product->description,
                'status' => ProductStatus::Draft->value,
                'is_featured' => false,
                'seo_title' => $product->seo_title,
                'seo_description' => $product->seo_description,
                'og_image' => $product->og_image,
            ]);

            if ($product->relationLoaded('categories')) {
                $copy->categories()->sync($product->categories->pluck('id')->toArray());
            }

            if ($product->relationLoaded('variants')) {
                foreach ($product->variants as $variant) {
                    $copy->variants()->create([
                        'name' => $variant->name,
                        'sku' => $variant->sku . '-CPY-' . Str::upper(Str::random(4)),
                        'price' => $variant->price,
                        'compare_price' => $variant->compare_price,
                        'cost_price' => $variant->cost_price,
                        'stock' => 0,
                        'weight' => $variant->weight,
                        'is_active' => false,
                        'attributes' => $variant->attributes,
                    ]);
                }
            }

            if ($product->relationLoaded('images')) {
                foreach ($product->images as $image) {
                    $copy->images()->create([
                        'url' => $image->url,
                        'thumbnail_url' => $image->thumbnail_url,
                        'alt_text' => $image->alt_text,
                        'is_primary' => $image->is_primary,
                        'sort_order' => $image->sort_order,
                    ]);
                }
            }

            return $copy->load(['categories', 'variants', 'images', 'brand']);
        });
    }

    public function bulkUpdateStatus(array $ids, string $status): void
    {
        DB::transaction(function () use ($ids, $status) {
            foreach ($ids as $id) {
                $this->productRepository->updateStatus($id, $status);
            }
        });
    }

    public function import(array $data): Collection
    {
        $products = new Collection();

        DB::transaction(function () use ($data, &$products) {
            foreach ($data as $row) {
                $dto = CreateProductDTO::fromArray($row);
                $products->push($this->create($dto));
            }
        });

        return $products;
    }

    public function export(): string
    {
        $products = $this->productRepository->all();

        $csv = fopen('php://temp', 'r+');
        fputcsv($csv, ['Name', 'Slug', 'SKU', 'Price', 'Status', 'Stock', 'Category']);

        foreach ($products as $product) {
            fputcsv($csv, [
                $product->name,
                $product->slug,
                $product->variants->first()?->sku ?? '',
                $product->variants->first()?->price ?? 0,
                $product->status,
                $product->variants->sum('stock'),
                $product->categories->pluck('name')->implode(', '),
            ]);
        }

        rewind($csv);
        $content = stream_get_contents($csv);
        fclose($csv);

        return $content;
    }

    public function getLowStock(): Collection
    {
        return $this->productRepository->getLowStock();
    }

    public function getFeatured(): Collection
    {
        return $this->productRepository->getFeatured();
    }

    public function search(string $query): Collection
    {
        return $this->productRepository->search($query);
    }
}
