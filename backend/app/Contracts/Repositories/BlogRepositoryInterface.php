<?php
declare(strict_types=1);

namespace App\Contracts\Repositories;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Collection;

interface BlogRepositoryInterface extends RepositoryInterface
{
    public function findBySlug(string $slug): ?Model;

    public function getPublished(): Collection;

    public function getByCategory(string $categoryId): Collection;
}
