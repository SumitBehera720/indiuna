<?php
declare(strict_types=1);

namespace App\Contracts\Repositories;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;
use App\DTOs\Product\ProductFilterDTO;

interface ProductRepositoryInterface extends RepositoryInterface
{
    public function findWithRelations(string $id): ?Model;

    public function findBySlug(string $slug): ?Model;

    public function search(string $query): Collection;

    public function getFeatured(): Collection;

    public function getByCategory(string $categoryId): Collection;

    public function getFiltered(ProductFilterDTO $filters): LengthAwarePaginator;

    public function updateStatus(string $id, string $status): Model;

    public function getLowStock(): Collection;

    public function getOutOfStock(): Collection;

    public function findWithTrashed(string $id): ?Model;
}
