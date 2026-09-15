<?php

namespace App\Models;

use App\Traits\HasSlug;
use App\Traits\HasUUID;
use Illuminate\Database\Eloquent\SoftDeletes;

class Page extends \Illuminate\Database\Eloquent\Model
{
    use HasUUID, SoftDeletes, HasSlug;

    protected $guarded = ['id'];

    protected function casts(): array
    {
        return [
            'is_published' => 'boolean',
            'sort_order' => 'integer',
        ];
    }
}
