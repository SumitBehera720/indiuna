<?php

namespace App\Models;

use App\Traits\HasSlug;
use App\Traits\HasUUID;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Supplier extends \Illuminate\Database\Eloquent\Model
{
    use HasUUID, SoftDeletes, HasSlug;

    protected $guarded = ['id'];

    protected function casts(): array
    {
        return [
            'status' => 'string',
        ];
    }

    public function purchaseOrders(): HasMany
    {
        return $this->hasMany(PurchaseOrder::class);
    }
}
