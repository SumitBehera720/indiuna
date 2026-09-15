<?php

namespace App\Models;

use App\Traits\HasUUID;

class Setting extends \Illuminate\Database\Eloquent\Model
{
    use HasUUID;

    protected $guarded = ['id'];

    protected function casts(): array
    {
        return [
            'type' => 'string',
            'is_encrypted' => 'boolean',
        ];
    }
}
