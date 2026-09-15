<?php

namespace App\Models;

use App\Traits\HasUUID;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Invoice extends \Illuminate\Database\Eloquent\Model
{
    use HasUUID;

    protected $guarded = ['id'];

    protected function casts(): array
    {
        return [
            'status' => 'string',
            'total' => 'decimal:2',
            'due_date' => 'datetime',
            'sent_at' => 'datetime',
            'paid_at' => 'datetime',
        ];
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }
}
