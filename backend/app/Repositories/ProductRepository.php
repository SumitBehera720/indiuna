<?php
declare(strict_types=1);

namespace App\Repositories;

use App\Contracts\Repositories\ProductRepositoryInterface;
use App\DTOs\Product\ProductFilterDTO;
use App\Models\Product;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

class ProductRepository extends BaseRepository implements ProductRepositoryInterface
{
    public function __construct()
    {
        parent::__construct(new Product());
    }

    public function findWithRelations(string $id): ?Model
    {
        return $this->model->with(['brand', 'categories', 'collections', 'variants', 'images'])->find($id);
    }

    public function findBySlug(string $slug): ?Model
    {
        return $this->model->where('slug', $slug)->first();
    }

    public function search(string $query): Collection
    {
        return $this->model->where('name', 'LIKE', "%{$query}%")
            ->orWhere('description', 'LIKE', "%{$query}%")
            ->get();
    }

    public function getFeatured(): Collection
    {
        return $this->model->where('is_featured', true)
            ->where('status', 'published')
            ->get();
    }

    public function getByCategory(string $categoryId): Collection
    {
        return $this->model->whereHas('categories', function ($q) use ($categoryId) {
            $q->where('id', $categoryId);
        })->get();
    }

    public function getFiltered(ProductFilterDTO $filters): LengthAwarePaginator
    {
        $query = $this->model->newQuery()->with(['variants', 'images', 'categories']);

        if ($filters->category_id) {
            $query->whereHas('categories', function ($q) use ($filters) {
                $q->where('id', $filters->category_id);
            });
        }

        if ($filters->brand_id) {
            $query->where('brand_id', $filters->brand_id);
        }

        if ($filters->status) {
            $query->where('status', $filters->status);
        }

        if ($filters->search) {
            $query->where(function ($q) use ($filters) {
                $q->where('name', 'LIKE', "%{$filters->search}%")
                    ->orWhere('description', 'LIKE', "%{$filters->search}%");
            });
        }

        if ($filters->price_min !== null) {
            $query->where('price', '>=', $filters->price_min);
        }

        if ($filters->price_max !== null) {
            $query->where('price', '<=', $filters->price_max);
        }

        if ($filters->tags) {
            $query->whereJsonContains('tags', $filters->tags);
        }

        if ($filters->date_from) {
            $query->whereDate('created_at', '>=', $filters->date_from);
        }

        if ($filters->date_to) {
            $query->whereDate('created_at', '<=', $filters->date_to);
        }

        $sortBy = $filters->sort_by ?: 'created_at';
        $sortOrder = $filters->sort_order ?: 'desc';

        $query->orderBy($sortBy, $sortOrder);

        return $query->paginate($filters->per_page ?: 15);
    }

    public function updateStatus(string $id, string $status): Model
    {
        $product = $this->findOrFail($id);
        $product->update(['status' => $status]);
        return $product->fresh();
    }

    public function getLowStock(): Collection
    {
        return $this->model->whereHas('variants', function ($q) {
            $q->where('stock', '<=', \DB::raw('low_stock_threshold'));
        })->get();
    }

    public function getOutOfStock(): Collection
    {
        return $this->model->whereHas('variants', function ($q) {
            $q->where('stock', 0);
        })->get();
    }

    public function findWithTrashed(string $id): ?Model
    {
        return $this->model->withTrashed()->find($id);
    }
}
