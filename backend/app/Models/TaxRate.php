<?php

namespace App\Models;

use App\Traits\HasUUID;

class TaxRate extends \Illuminate\Database\Eloquent\Model
{
    use HasUUID;

    protected $guarded = ['id'];

    protected function casts(): array
    {
        return [
            'rate' => 'decimal:2',
            'type' => 'string',
            'is_compound' => 'boolean',
            'applies_to' => 'string',
            'priority' => 'integer',
            'is_active' => 'boolean',
        ];
    }
}
