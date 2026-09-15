<?php
declare(strict_types=1);

namespace App\Repositories;

use App\Contracts\Repositories\BlogRepositoryInterface;
use App\Models\Blog;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Collection;

class BlogRepository extends BaseRepository implements BlogRepositoryInterface
{
    public function __construct()
    {
        parent::__construct(new Blog());
    }

    public function findBySlug(string $slug): ?Model
    {
        return $this->model->where('slug', $slug)->first();
    }

    public function getPublished(): Collection
    {
        return $this->model->where('is_published', true)
            ->orderBy('published_at', 'desc')
            ->get();
    }

    public function getByCategory(string $categoryId): Collection
    {
        return $this->model->where('blog_category_id', $categoryId)->get();
    }
}
