<?php

namespace App\Models;

use App\Traits\HasUUID;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ShipmentTracking extends \Illuminate\Database\Eloquent\Model
{
    use HasUUID;

    protected $table = 'shipment_tracking';

    protected $guarded = ['id'];

    protected function casts(): array
    {
        return [
            'tracked_at' => 'datetime',
            'meta_data' => 'array',
        ];
    }

    public function shipment(): BelongsTo
    {
        return $this->belongsTo(Shipment::class);
    }
}
