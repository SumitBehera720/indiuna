<?php

namespace App\Helpers;

use Illuminate\Support\Facades\Storage;

class ImageHelper
{
    public static function getUrl(?string $path, ?int $width = null, ?int $height = null): ?string
    {
        if (empty($path)) {
            return null;
        }

        if (str_starts_with($path, 'http://') || str_starts_with($path, 'https://')) {
            return $path;
        }

        $url = Storage::disk('public')->url($path);

        // Protocol fix if request is HTTPS
        if (request()->secure() && str_starts_with($url, 'http://')) {
            $url = 'https://' . substr($url, 7);
        }

        if ($width || $height) {
            $params = http_build_query(array_filter([
                'w' => $width,
                'h' => $height,
                'fit' => 'crop',
            ]));
            $url .= '?' . $params;
        }

        return $url;
    }

    public static function getThumbnailUrl(?string $path): ?string
    {
        if (empty($path)) {
            return self::getPlaceholderUrl();
        }

        $thumbnailPath = preg_replace('/\/([^\/]+)$/', '/thumb_$1', $path);

        if (Storage::disk('public')->exists($thumbnailPath)) {
            return Storage::disk('public')->url($thumbnailPath);
        }

        return self::getUrl($path, 150, 150);
    }

    public static function getPlaceholderUrl(): string
    {
        return asset('images/placeholder.jpg');
    }
}
