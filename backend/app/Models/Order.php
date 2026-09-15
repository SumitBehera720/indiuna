<?php

namespace App\Models;

use App\Enums\OrderStatus;
use App\Enums\PaymentStatus;
use App\Enums\ShippingStatus;
use App\Traits\HasUUID;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Order extends \Illuminate\Database\Eloquent\Model
{
    use HasUUID, SoftDeletes;

    protected $guarded = ['id'];

    protected function casts(): array
    {
        return [
            'status' => OrderStatus::class,
            'payment_status' => PaymentStatus::class,
            'shipping_status' => ShippingStatus::class,
            'subtotal' => 'decimal:2',
            'discount_total' => 'decimal:2',
            'shipping_total' => 'decimal:2',
            'tax_total' => 'decimal:2',
            'grand_total' => 'decimal:2',
            'paid_total' => 'decimal:2',
            'due_total' => 'decimal:2',
            'refund_total' => 'decimal:2',
            'coupon_discount' => 'decimal:2',
            'is_gift' => 'boolean',
            'meta_data' => 'array',
            'paid_at' => 'datetime',
            'shipped_at' => 'datetime',
            'delivered_at' => 'datetime',
            'cancelled_at' => 'datetime',
            'returned_at' => 'datetime',
        ];
    }

    public function getEmailAttribute(): ?string
    {
        return $this->shipping_email ?? $this->billing_email;
    }

    public function getPhoneAttribute(): ?string
    {
        return $this->shipping_phone ?? $this->billing_phone;
    }

    public function getPlacedAtAttribute()
    {
        return $this->created_at;
    }

    public function getShippingAddressAttribute(): ?array
    {
        if (!$this->shipping_address_line1) {
            return null;
        }

        return [
            'first_name' => $this->shipping_first_name,
            'last_name' => $this->shipping_last_name,
            'phone' => $this->shipping_phone,
            'email' => $this->shipping_email,
            'address_line1' => $this->shipping_address_line1,
            'address_line2' => $this->shipping_address_line2,
            'city' => $this->shipping_city,
            'state' => $this->shipping_state,
            'postal_code' => $this->shipping_postal_code,
            'pincode' => $this->shipping_postal_code,
            'country' => $this->shipping_country,
        ];
    }

    public function getBillingAddressAttribute(): ?array
    {
        if (!$this->billing_address_line1) {
            return null;
        }

        return [
            'first_name' => $this->billing_first_name,
            'last_name' => $this->billing_last_name,
            'phone' => $this->billing_phone,
            'email' => $this->billing_email,
            'address_line1' => $this->billing_address_line1,
            'address_line2' => $this->billing_address_line2,
            'city' => $this->billing_city,
            'state' => $this->billing_state,
            'postal_code' => $this->billing_postal_code,
            'pincode' => $this->billing_postal_code,
            'country' => $this->billing_country,
        ];
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function statusHistory(): HasMany
    {
        return $this->hasMany(OrderStatusHistory::class);
    }

    public function timeline(): HasMany
    {
        return $this->statusHistory();
    }

    public function notes(): HasMany
    {
        return $this->hasMany(OrderNote::class);
    }

    public function invoices(): HasMany
    {
        return $this->hasMany(Invoice::class);
    }

    public function shipments(): HasMany
    {
        return $this->hasMany(Shipment::class);
    }

    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }

    public function returns(): HasMany
    {
        return $this->hasMany(Returns::class);
    }

    public function refunds(): HasMany
    {
        return $this->hasMany(Refund::class);
    }

    public function coupon(): BelongsTo
    {
        return $this->belongsTo(Coupon::class);
    }

    public function shippingMethod(): BelongsTo
    {
        return $this->belongsTo(ShippingMethod::class);
    }
}
