<?php
declare(strict_types=1);

namespace App\Actions\Media;

use Illuminate\Support\Facades\Storage;
use Intervention\Image\ImageManager;
use Intervention\Image\Drivers\Gd\Driver;

class ProcessImageAction
{
    private array $sizes = [
        'large' => ['width' => 1200, 'height' => 1200],
        'medium' => ['width' => 600, 'height' => 600],
        'thumbnail' => ['width' => 300, 'height' => 300],
    ];

    public function execute(string $filePath): array
    {
        $disk = Storage::disk('public');

        if (!$disk->exists($filePath)) {
            throw new \RuntimeException("File not found: {$filePath}");
        }

        $fullPath = $disk->path($filePath);
        $pathInfo = pathinfo($filePath);
        $dirname = $pathInfo['dirname'];
        $filename = $pathInfo['filename'];

        $processed = [];

        $manager = new ImageManager(new Driver());

        foreach ($this->sizes as $sizeName => $dimensions) {
            $img = $manager->read($fullPath);
            $img->cover($dimensions['width'], $dimensions['height']);

            $resizedPath = "{$dirname}/{$sizeName}_{$filename}.webp";
            $disk->put($resizedPath, (string) $img->toWebp(80));

            $processed[$sizeName] = [
                'path' => $resizedPath,
                'url' => $disk->url($resizedPath),
                'width' => $dimensions['width'],
                'height' => $dimensions['height'],
            ];
        }

        $webpPath = "{$dirname}/{$filename}.webp";
        $webpImg = $manager->read($fullPath);
        $disk->put($webpPath, (string) $webpImg->toWebp(80));

        $processed['original_webp'] = [
            'path' => $webpPath,
            'url' => $disk->url($webpPath),
            'width' => $webpImg->width(),
            'height' => $webpImg->height(),
        ];

        return [
            'thumbnail' => $processed['thumbnail'],
            'medium' => $processed['medium'],
            'large' => $processed['large'],
            'original_webp' => $processed['original_webp'],
        ];
    }
}
