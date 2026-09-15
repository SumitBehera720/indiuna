<?php

namespace App\Traits;

use App\Models\Media;
use Illuminate\Database\Eloquent\Relations\MorphMany;

trait HasMedia
{
    public function media(): MorphMany
    {
        return $this->morphMany(Media::class, 'mediable');
    }

    public function getPrimaryMediaAttribute()
    {
        return $this->media()->where('is_primary', true)->first();
    }

    public function getThumbnailUrlAttribute(): string
    {
        $primary = $this->primary_media;

        if ($primary && $primary->url) {
            return $primary->url;
        }

        return $this->getDefaultThumbnailUrl();
    }

    protected function getDefaultThumbnailUrl(): string
    {
        return asset('images/placeholder.jpg');
    }
}
