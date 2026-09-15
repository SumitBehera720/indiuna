<?php

namespace App\Models;

use App\Enums\ProductStatus;
use App\Traits\Filterable;
use App\Traits\HasMedia;
use App\Traits\HasSlug;
use App\Traits\HasUUID;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Product extends \Illuminate\Database\Eloquent\Model
{
    use HasUUID, SoftDeletes, HasSlug, HasMedia, Filterable;

    protected $guarded = ['id'];

    protected function casts(): array
    {
        return [
            'type' => 'string',
            'status' => ProductStatus::class,
            'tags' => 'array',
            'meta_data' => 'array',
            'is_featured' => 'boolean',
            'published_at' => 'datetime',
            'scheduled_at' => 'datetime',
        ];
    }

    public function brand(): BelongsTo
    {
        return $this->belongsTo(Brand::class);
    }

    public function variants(): HasMany
    {
        return $this->hasMany(ProductVariant::class);
    }

    public function images(): HasMany
    {
        return $this->hasMany(ProductImage::class);
    }

    public function backInStockSubscriptions(): HasMany
    {
        return $this->hasMany(BackInStockSubscription::class);
    }

    public function categories(): BelongsToMany
    {
        return $this->belongsToMany(Category::class)->withPivot('is_primary', 'sort_order');
    }

    public function collections(): BelongsToMany
    {
        return $this->belongsToMany(Collection::class);
    }

    public function tagsRelation(): BelongsToMany
    {
        return $this->belongsToMany(Tag::class);
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(Review::class);
    }

    public function orderItems(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function cartItems(): HasMany
    {
        return $this->hasMany(CartItem::class);
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function updatedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    public function flashSales(): BelongsToMany
    {
        return $this->belongsToMany(FlashSale::class)->withPivot('discount_price', 'quantity_limit', 'sold_count');
    }
}
