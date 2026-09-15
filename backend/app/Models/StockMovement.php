<?php

namespace App\Models;

use App\Enums\StockMovementType;
use App\Traits\HasUUID;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StockMovement extends \Illuminate\Database\Eloquent\Model
{
    use HasUUID;

    protected $guarded = ['id'];

    protected function casts(): array
    {
        return [
            'type' => StockMovementType::class,
            'quantity' => 'integer',
            'before_quantity' => 'integer',
            'after_quantity' => 'integer',
        ];
    }

    public function variant(): BelongsTo
    {
        return $this->belongsTo(ProductVariant::class, 'variant_id');
    }

    public function warehouse(): BelongsTo
    {
        return $this->belongsTo(Warehouse::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
