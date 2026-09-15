<?php

namespace App\Traits;

use Illuminate\Database\Eloquent\Builder;

trait Filterable
{
    public function scopeFilter(Builder $query, array $filters): Builder
    {
        $filterable = property_exists($this, 'filterable') ? $this->filterable : [];

        if (!empty($filters['search']) && !empty($filterable['search'] ?? [])) {
            $query->where(function (Builder $q) use ($filters, $filterable) {
                foreach ($filterable['search'] as $field) {
                    $q->orWhere($field, 'like', '%' . $filters['search'] . '%');
                }
            });
        }

        if (!empty($filters['status'])) {
            $statusField = $filterable['status'] ?? 'status';
            $query->where($statusField, $filters['status']);
        }

        if (!empty($filters['date_from'])) {
            $dateField = $filterable['date'] ?? 'created_at';
            $query->whereDate($dateField, '>=', $filters['date_from']);
        }

        if (!empty($filters['date_to'])) {
            $dateField = $filterable['date'] ?? 'created_at';
            $query->whereDate($dateField, '<=', $filters['date_to']);
        }

        $sortBy = $filters['sort_by'] ?? ($filterable['sort_by'] ?? 'created_at');
        $sortOrder = $filters['sort_order'] ?? ($filterable['sort_order'] ?? 'desc');

        if (in_array($sortBy, $filterable['allowed_sort_fields'] ?? ['created_at', 'updated_at', 'id', 'name', 'title', 'status', 'sort_order'])) {
            $query->orderBy($sortBy, $sortOrder === 'asc' ? 'asc' : 'desc');
        }

        return $query;
    }
}
