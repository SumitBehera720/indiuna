<?php

namespace App\Models;

use App\Traits\HasUUID;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class ShippingZone extends \Illuminate\Database\Eloquent\Model
{
    use HasUUID, SoftDeletes;

    protected $guarded = ['id'];

    protected function casts(): array
    {
        return [
            'countries' => 'array',
            'states' => 'array',
            'status' => 'string',
        ];
    }

    public function methods(): BelongsToMany
    {
        return $this->belongsToMany(ShippingMethod::class, 'shipping_zone_shipping_method');
    }

    public function rates(): HasMany
    {
        return $this->hasMany(ShippingRate::class);
    }

    public function shippingRates(): HasMany
    {
        return $this->hasMany(ShippingRate::class);
    }
}
