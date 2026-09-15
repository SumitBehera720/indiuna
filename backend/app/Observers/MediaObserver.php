<?php
declare(strict_types=1);

namespace App\Observers;

use App\Models\Media;
use Illuminate\Support\Facades\Storage;

class MediaObserver
{
    public function deleted(Media $media): void
    {
        if ($media->path) {
            Storage::disk($media->disk ?? 'public')->delete($media->path);
        }
    }
}
