<?php

namespace App\Traits;

use Illuminate\Database\Eloquent\Builder;

trait HasStatus
{
    public function scopeWhereStatus(Builder $query, string $status): Builder
    {
        return $query->where('status', $status);
    }

    public function scopeActive(Builder $query): Builder
    {
        $activeStatuses = defined('static::ACTIVE_STATUSES') ? static::ACTIVE_STATUSES : ['published', 'active', 'confirmed'];
        return $query->whereIn('status', $activeStatuses);
    }

    public function scopeInactive(Builder $query): Builder
    {
        $activeStatuses = defined('static::ACTIVE_STATUSES') ? static::ACTIVE_STATUSES : ['published', 'active', 'confirmed'];
        return $query->whereNotIn('status', $activeStatuses);
    }

    public function getStatusLabelAttribute(): string
    {
        $labels = defined('static::STATUS_LABELS') ? static::STATUS_LABELS : [];

        return $labels[$this->status] ?? ucfirst(str_replace('_', ' ', $this->status));
    }
}
