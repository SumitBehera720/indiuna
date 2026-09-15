<?php

namespace App\Models;

use App\Traits\HasUUID;
use Illuminate\Database\Eloquent\SoftDeletes;

class ApiKey extends \Illuminate\Database\Eloquent\Model
{
    use HasUUID, SoftDeletes;

    protected $guarded = ['id'];

    protected function casts(): array
    {
        return [
            'last_used_at' => 'datetime',
            'expires_at' => 'datetime',
            'status' => 'string',
            'permissions' => 'array',
        ];
    }
}
