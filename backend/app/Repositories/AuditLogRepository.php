<?php
declare(strict_types=1);

namespace App\Repositories;

use App\Contracts\Repositories\AuditLogRepositoryInterface;
use App\Models\AuditLog;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

class AuditLogRepository extends BaseRepository implements AuditLogRepositoryInterface
{
    public function __construct()
    {
        parent::__construct(new AuditLog());
    }

    public function getByTarget(string $type, string $id): Collection
    {
        return $this->model->where('target_type', $type)
            ->where('target_id', $id)
            ->get();
    }

    public function getByActor(string $type, string $id): Collection
    {
        return $this->model->where('actor_type', $type)
            ->where('actor_id', $id)
            ->get();
    }

    public function getFiltered(array $filters): LengthAwarePaginator
    {
        $query = $this->model->newQuery();

        if (!empty($filters['event_type'])) {
            $query->where('event', $filters['event_type']);
        }

        if (!empty($filters['actor_type'])) {
            $query->where('actor_type', $filters['actor_type']);
        }

        if (!empty($filters['target_type'])) {
            $query->where('target_type', $filters['target_type']);
        }

        if (!empty($filters['date_from'])) {
            $query->whereDate('created_at', '>=', $filters['date_from']);
        }

        if (!empty($filters['date_to'])) {
            $query->whereDate('created_at', '<=', $filters['date_to']);
        }

        $sortBy = $filters['sort_by'] ?? 'created_at';
        $sortOrder = $filters['sort_order'] ?? 'desc';
        $perPage = $filters['per_page'] ?? 15;

        $query->orderBy($sortBy, $sortOrder);

        return $query->paginate($perPage);
    }
}
