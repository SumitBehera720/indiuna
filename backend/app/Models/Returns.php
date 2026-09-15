<?php

namespace App\Models;

use App\Enums\ReturnStatus;
use App\Traits\HasUUID;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Returns extends \Illuminate\Database\Eloquent\Model
{
    use HasUUID;

    protected $guarded = ['id'];

    protected $table = 'returns';

    protected function casts(): array
    {
        return [
            'status' => ReturnStatus::class,
            'pickup_address' => 'array',
            'requested_at' => 'datetime',
            'approved_at' => 'datetime',
            'picked_up_at' => 'datetime',
            'inspected_at' => 'datetime',
            'refunded_at' => 'datetime',
        ];
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(ReturnItem::class);
    }

    public function refunds(): HasMany
    {
        return $this->hasMany(Refund::class);
    }
}
