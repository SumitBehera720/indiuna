<?php

namespace App\Models;

use App\Traits\HasMedia;
use App\Traits\HasSlug;
use App\Traits\HasUUID;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Brand extends \Illuminate\Database\Eloquent\Model
{
    use HasUUID, SoftDeletes, HasSlug, HasMedia;

    protected $guarded = ['id'];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'sort_order' => 'integer',
        ];
    }

    public function products(): HasMany
    {
        return $this->hasMany(Product::class);
    }
}
