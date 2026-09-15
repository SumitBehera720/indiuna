<?php

namespace App\Models;

use App\Traits\HasUUID;

class NewsletterSubscriber extends \Illuminate\Database\Eloquent\Model
{
    use HasUUID;

    protected $guarded = ['id'];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'subscribed_at' => 'datetime',
            'unsubscribed_at' => 'datetime',
        ];
    }
}
