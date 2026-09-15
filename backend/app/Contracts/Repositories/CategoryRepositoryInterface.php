<?php
declare(strict_types=1);

namespace App\Contracts\Repositories;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Collection;

interface CategoryRepositoryInterface extends RepositoryInterface
{
    public function getTree(): Collection;

    public function getChildren(string $id): Collection;

    public function getParent(string $id): ?Model;

    public function getFeatured(): Collection;

    public function reorder(array $order): void;
}
