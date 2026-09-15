<?php
declare(strict_types=1);

namespace App\Contracts\Repositories;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

interface RepositoryInterface
{
    public function all(array $columns = ['*']): Collection;

    public function find(string $id): ?Model;

    public function findOrFail(string $id): Model;

    public function create(array $data): Model;

    public function update(Model $model, array $data): Model;

    public function delete(Model $model): bool;

    public function forceDelete(Model $model): bool;

    public function restore(Model $model): bool;

    public function paginate(int $perPage = 15, array $columns = ['*'], string $pageName = 'page', ?int $page = null): LengthAwarePaginator;

    public function findByField(string $field, mixed $value, array $columns = ['*']): Collection;

    public function findWhere(array $conditions, array $columns = ['*']): Collection;

    public function findWhereIn(string $field, array $values, array $columns = ['*']): Collection;

    public function count(): int;

    public function exists(string $id): bool;
}
