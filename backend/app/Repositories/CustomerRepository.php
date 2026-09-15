<?php
declare(strict_types=1);

namespace App\Repositories;

use App\Contracts\Repositories\CustomerRepositoryInterface;
use App\DTOs\Customer\CustomerFilterDTO;
use App\Models\Customer;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

class CustomerRepository extends BaseRepository implements CustomerRepositoryInterface
{
    public function __construct()
    {
        parent::__construct(new Customer());
    }

    public function findByEmail(string $email): ?Model
    {
        return $this->model->where('email', $email)->first();
    }

    public function search(string $query): Collection
    {
        return $this->model->where('first_name', 'LIKE', "%{$query}%")
            ->orWhere('last_name', 'LIKE', "%{$query}%")
            ->orWhere('email', 'LIKE', "%{$query}%")
            ->orWhere('phone', 'LIKE', "%{$query}%")
            ->get();
    }

    public function getFiltered(CustomerFilterDTO $filters): LengthAwarePaginator
    {
        $query = $this->model->newQuery();

        if ($filters->search) {
            $query->where(function ($q) use ($filters) {
                $q->where('first_name', 'LIKE', "%{$filters->search}%")
                    ->orWhere('last_name', 'LIKE', "%{$filters->search}%")
                    ->orWhere('email', 'LIKE', "%{$filters->search}%")
                    ->orWhere('phone', 'LIKE', "%{$filters->search}%");
            });
        }

        if ($filters->is_active !== null) {
            $query->where('is_active', $filters->is_active);
        }

        if ($filters->date_from) {
            $query->whereDate('created_at', '>=', $filters->date_from);
        }

        if ($filters->date_to) {
            $query->whereDate('created_at', '<=', $filters->date_to);
        }

        $sortBy = $filters->sort_by ?: 'created_at';
        $sortOrder = $filters->sort_order ?: 'desc';

        $query->orderBy($sortBy, $sortOrder);

        return $query->paginate($filters->per_page ?: 15);
    }

    public function getWithTrashed(): Collection
    {
        return $this->model->withTrashed()->get();
    }

    public function findWithAddresses(string $id): ?Model
    {
        return $this->model->with(['addresses', 'user'])->findOrFail($id);
    }
}
