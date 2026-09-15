<?php
declare(strict_types=1);

namespace App\Repositories;

use App\Contracts\Repositories\CategoryRepositoryInterface;
use App\Models\Category;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Collection;

class CategoryRepository extends BaseRepository implements CategoryRepositoryInterface
{
    public function __construct()
    {
        parent::__construct(new Category());
    }

    public function all(array $columns = ['*']): Collection
    {
        return $this->model->with('parent')->orderBy('sort_order')->get($columns);
    }

    public function getTree(): Collection
    {
        return $this->model->with('parent')->orderBy('sort_order')->get()->load('children');
    }

    public function getChildren(string $id): Collection
    {
        $category = $this->findOrFail($id);
        return $category->children;
    }

    public function getParent(string $id): ?Model
    {
        $category = $this->findOrFail($id);
        return $category->parent;
    }

    public function getFeatured(): Collection
    {
        return $this->model->where('is_featured', true)->get();
    }

    public function reorder(array $order): void
    {
        foreach ($order as $id => $sortOrder) {
            $this->model->where('id', $id)->update(['sort_order' => $sortOrder]);
        }
    }
}
