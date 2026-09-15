<?php
declare(strict_types=1);

namespace App\Contracts\Repositories;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;
use App\DTOs\Customer\CustomerFilterDTO;

interface CustomerRepositoryInterface extends RepositoryInterface
{
    public function findByEmail(string $email): ?Model;

    public function search(string $query): Collection;

    public function getFiltered(CustomerFilterDTO $filters): LengthAwarePaginator;

    public function getWithTrashed(): Collection;

    public function findWithAddresses(string $id): ?Model;
}
