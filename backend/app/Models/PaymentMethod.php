<?php

namespace App\Models;

use App\Traits\HasUUID;
use Illuminate\Database\Eloquent\SoftDeletes;

class PaymentMethod extends \Illuminate\Database\Eloquent\Model
{
    use HasUUID, SoftDeletes;

    protected $guarded = ['id'];

    protected function casts(): array
    {
        return [
            'enabled' => 'boolean',
            'sort_order' => 'integer',
        ];
    }
}
