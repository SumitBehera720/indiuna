<?php

namespace App\Models;

use App\Traits\HasUUID;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ShippingMethod extends \Illuminate\Database\Eloquent\Model
{
    use HasUUID;

    protected $guarded = ['id'];

    protected function casts(): array
    {
        return [
            'estimated_days_min' => 'integer',
            'estimated_days_max' => 'integer',
            'is_free' => 'boolean',
            'is_active' => 'boolean',
            'sort_order' => 'integer',
        ];
    }

    public function rates(): HasMany
    {
        return $this->hasMany(ShippingRate::class);
    }

    public function zones(): BelongsToMany
    {
        return $this->belongsToMany(ShippingZone::class, 'shipping_zone_methods');
    }
}
