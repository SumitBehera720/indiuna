<?php
declare(strict_types=1);

namespace App\Services;

use App\Models\Collection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Collection as EloquentCollection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class CollectionService
{
    public function getAll(): EloquentCollection
    {
        return Collection::orderBy('sort_order')->get();
    }

    public function getById(string $id): ?Model
    {
        return Collection::findOrFail($id);
    }

    public function create(array $data): Model
    {
        return DB::transaction(function () use ($data) {
            if (empty($data['slug'])) {
                $data['slug'] = Str::slug($data['name']);
            }

            return Collection::create($data);
        });
    }

    public function update(string $id, array $data): Model
    {
        $collection = Collection::findOrFail($id);

        return DB::transaction(function () use ($collection, $data) {
            $collection->update($data);
            return $collection->fresh();
        });
    }

    public function delete(string $id): bool
    {
        $collection = Collection::findOrFail($id);
        return $collection->delete();
    }

    public function assignProducts(string $id, array $productIds): Model
    {
        $collection = Collection::findOrFail($id);
        $collection->products()->syncWithoutDetaching($productIds);
        return $collection->fresh()->load('products');
    }

    public function removeProduct(string $id, string $productId): Model
    {
        $collection = Collection::findOrFail($id);
        $collection->products()->detach($productId);
        return $collection->fresh()->load('products');
    }
}
