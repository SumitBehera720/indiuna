<?php

namespace App\Models;

use App\Traits\HasUUID;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class AuditLog extends \Illuminate\Database\Eloquent\Model
{
    use HasUUID;

    protected $guarded = ['id'];

    protected function casts(): array
    {
        return [
            'event' => 'string',
            'new_values' => 'array',
            'old_values' => 'array',
        ];
    }

    public function getActionAttribute(): ?string
    {
        return $this->event;
    }

    public function setActionAttribute(?string $value): void
    {
        $this->event = $value;
    }

    public function getEventTypeAttribute(): ?string
    {
        return $this->event;
    }

    public function setEventTypeAttribute(?string $value): void
    {
        $this->event = $value;
    }

    public function getChangesAttribute()
    {
        return $this->new_values;
    }

    public function setChangesAttribute($value): void
    {
        $this->new_values = $value;
    }

    public function actor(): MorphTo
    {
        return $this->morphTo();
    }

    public function target(): MorphTo
    {
        return $this->morphTo();
    }
}
