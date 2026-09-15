<?php

namespace App\Models;

use App\Traits\HasUUID;
use Illuminate\Database\Eloquent\SoftDeletes;

class NewsletterCampaign extends \Illuminate\Database\Eloquent\Model
{
    use HasUUID, SoftDeletes;

    protected $guarded = ['id'];

    protected function casts(): array
    {
        return [
            'status' => 'string',
            'sent_at' => 'datetime',
            'sent_count' => 'integer',
            'opened_count' => 'integer',
            'clicked_count' => 'integer',
        ];
    }
}
