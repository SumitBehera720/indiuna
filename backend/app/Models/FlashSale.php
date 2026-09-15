<?php

namespace App\Models;

use App\Enums\DiscountType;
use App\Traits\HasSlug;
use App\Traits\HasUUID;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class FlashSale extends \Illuminate\Database\Eloquent\Model
{
    use HasUUID, SoftDeletes, HasSlug;

    protected $guarded = ['id'];

    protected function casts(): array
    {
        return [
            'discount_type' => DiscountType::class,
            'discount_value' => 'decimal:2',
            'is_active' => 'boolean',
            'starts_at' => 'datetime',
            'ends_at' => 'datetime',
        ];
    }

    public function products(): BelongsToMany
    {
        return $this->belongsToMany(Product::class)->withPivot('discount_price', 'quantity_limit', 'sold_count');
    }
}
