<?php
declare(strict_types=1);

namespace App\Services;

use App\Models\Brand;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class BrandService
{
    public function getAll(): Collection
    {
        return Brand::orderBy('sort_order')->get();
    }

    public function getById(string $id): ?Model
    {
        return Brand::findOrFail($id);
    }

    public function create(array $data): Model
    {
        return DB::transaction(function () use ($data) {
            if (empty($data['slug'])) {
                $data['slug'] = Str::slug($data['name']);
            }

            return Brand::create($data);
        });
    }

    public function update(string $id, array $data): Model
    {
        $brand = Brand::findOrFail($id);

        return DB::transaction(function () use ($brand, $data) {
            $brand->update($data);
            return $brand->fresh();
        });
    }

    public function delete(string $id): bool
    {
        $brand = Brand::findOrFail($id);
        return $brand->delete();
    }
}
