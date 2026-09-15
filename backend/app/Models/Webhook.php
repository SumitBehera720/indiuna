<?php

namespace App\Models;

use App\Traits\HasUUID;
use Illuminate\Database\Eloquent\SoftDeletes;

class Webhook extends \Illuminate\Database\Eloquent\Model
{
    use HasUUID, SoftDeletes;

    protected $guarded = ['id'];

    protected function casts(): array
    {
        return [
            'events' => 'array',
            'status' => 'string',
            'last_called_at' => 'datetime',
            'failure_count' => 'integer',
        ];
    }
}
