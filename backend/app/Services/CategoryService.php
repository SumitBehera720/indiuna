<?php
declare(strict_types=1);

namespace App\Services;

use App\Contracts\Repositories\CategoryRepositoryInterface;
use App\Traits\HasSlug;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class CategoryService
{
    public function __construct(
        private readonly CategoryRepositoryInterface $categoryRepository,
    ) {}

    public function getAll(): Collection
    {
        return $this->categoryRepository->all();
    }

    public function getTree(): Collection
    {
        return $this->categoryRepository->getTree();
    }

    public function getById(string $id): ?Model
    {
        $category = $this->categoryRepository->findOrFail($id);
        return $category->load(['parent', 'children']);
    }

    public function create(array $data): Model
    {
        return DB::transaction(function () use ($data) {
            if (empty($data['slug'])) {
                $data['slug'] = Str::slug($data['name']);
            }

            if (!empty($data['parent_id'])) {
                $parent = $this->categoryRepository->findOrFail($data['parent_id']);
                $data['depth'] = ($parent->depth ?? 0) + 1;
            }

            return $this->categoryRepository->create($data);
        });
    }

    public function update(string $id, array $data): Model
    {
        $category = $this->categoryRepository->findOrFail($id);

        return DB::transaction(function () use ($category, $data) {
            if (!empty($data['parent_id'])) {
                $parent = $this->categoryRepository->findOrFail($data['parent_id']);
                $data['depth'] = ($parent->depth ?? 0) + 1;
            }

            return $this->categoryRepository->update($category, $data);
        });
    }

    public function delete(string $id): bool
    {
        return DB::transaction(function () use ($id) {
            $category = $this->categoryRepository->findOrFail($id);

            $children = $this->categoryRepository->getChildren($id);

            foreach ($children as $child) {
                $this->categoryRepository->update($child, [
                    'parent_id' => $category->parent_id,
                ]);
            }

            return $this->categoryRepository->delete($category);
        });
    }

    public function reorder(array $order): void
    {
        $this->categoryRepository->reorder($order);
    }

    public function getFeatured(): Collection
    {
        return $this->categoryRepository->getFeatured();
    }
}
