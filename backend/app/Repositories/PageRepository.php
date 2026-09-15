<?php
declare(strict_types=1);

namespace App\Repositories;

use App\Contracts\Repositories\PageRepositoryInterface;
use App\Models\Page;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Collection;

class PageRepository extends BaseRepository implements PageRepositoryInterface
{
    public function __construct()
    {
        parent::__construct(new Page());
    }

    public function findBySlug(string $slug): ?Model
    {
        return $this->model->where('slug', $slug)->first();
    }

    public function getPublished(): Collection
    {
        return $this->model->where('is_published', true)->get();
    }
}
