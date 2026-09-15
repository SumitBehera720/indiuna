<?php

namespace App\Models;

use App\Traits\Filterable;
use App\Traits\HasUUID;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Customer extends \Illuminate\Database\Eloquent\Model
{
    use HasUUID, SoftDeletes, Filterable;

    protected $guarded = ['id'];

    protected function casts(): array
    {
        return [
            'gender' => 'string',
            'is_active' => 'boolean',
            'is_verified' => 'boolean',
            'last_purchased_at' => 'datetime',
            'total_orders' => 'integer',
            'total_spent' => 'decimal:2',
            'average_order_value' => 'decimal:2',
            'metadata' => 'array',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function addresses(): HasMany
    {
        return $this->hasMany(CustomerAddress::class);
    }

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }

    public function wishlist(): BelongsToMany
    {
        return $this->belongsToMany(Product::class, 'customer_wishlist')->withTimestamps();
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(Review::class);
    }

    public function couponUsages(): HasMany
    {
        return $this->hasMany(CouponUsage::class);
    }

    public function loyaltyPoints(): HasMany
    {
        return $this->hasMany(LoyaltyPoint::class);
    }

    public function giftCards(): HasMany
    {
        return $this->hasMany(GiftCard::class);
    }

    public function supportTickets(): HasMany
    {
        return $this->hasMany(SupportTicket::class);
    }

    public function returns(): HasMany
    {
        return $this->hasMany(Returns::class);
    }
}
