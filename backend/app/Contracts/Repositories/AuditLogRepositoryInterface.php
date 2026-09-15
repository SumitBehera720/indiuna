<?php
declare(strict_types=1);

namespace App\Contracts\Repositories;

use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

interface AuditLogRepositoryInterface extends RepositoryInterface
{
    public function getByTarget(string $type, string $id): Collection;

    public function getByActor(string $type, string $id): Collection;

    public function getFiltered(array $filters): LengthAwarePaginator;
}
