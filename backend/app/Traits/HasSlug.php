<?php

namespace App\Traits;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

trait HasSlug
{
    public static function bootHasSlug(): void
    {
        static::creating(function (Model $model) {
            $sourceField = property_exists($model, 'sourceField') ? $model->sourceField : 'name';
            if (empty($model->slug)) {
                $model->slug = static::generateUniqueSlug($model, $sourceField);
            }
        });
    }

    public static function generateUniqueSlug(Model $model, string $sourceField): string
    {
        $slug = Str::slug($model->{$sourceField});
        $originalSlug = $slug;
        $counter = 2;

        while (static::slugExists($slug, $model)) {
            $slug = $originalSlug . '-' . $counter;
            $counter++;
        }

        return $slug;
    }

    protected static function slugExists(string $slug, Model $model): bool
    {
        $query = static::where('slug', $slug);
        if ($model->exists) {
            $query->where($model->getKeyName(), '!=', $model->getKey());
        }
        return $query->exists();
    }
}
