<?php
declare(strict_types=1);

namespace App\Jobs;

use App\Actions\Media\ProcessImageAction;
use App\Models\Media;
use App\Repositories\MediaRepository;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class ProcessImageUpload implements ShouldQueue
{
    use Queueable;

    public function __construct(
        private readonly mixed $file,
        private readonly ?string $folderId = null,
        private readonly ?string $mediableType = null,
        private readonly ?string $mediableId = null,
    ) {}

    public function handle(MediaRepository $mediaRepository, ProcessImageAction $processImageAction): void
    {
        $disk = Storage::disk('public');

        if ($this->file instanceof UploadedFile) {
            $extension = strtolower($this->file->getClientOriginalExtension());
            $fileName = pathinfo($this->file->getClientOriginalName(), PATHINFO_FILENAME);
            $safeName = \Illuminate\Support\Str::slug($fileName) . '-' . now()->timestamp . '.' . $extension;
            $folderName = $this->folderId ? $this->folderId : 'general';
            $path = $this->file->storeAs("media/{$folderName}", $safeName, 'public');
        } elseif (is_string($this->file)) {
            $path = $this->file;
            $safeName = basename($this->file);
            $fileName = pathinfo($safeName, PATHINFO_FILENAME);
            $extension = pathinfo($safeName, PATHINFO_EXTENSION);
        } else {
            throw new \RuntimeException('Invalid file input');
        }

        $fullPath = $disk->path($path);

        $processed = $processImageAction->execute($path);

        $media = $mediaRepository->create([
            'name' => $fileName,
            'file_name' => $safeName,
            'path' => $path,
            'url' => $disk->url($path),
            'thumbnail_url' => $processed['thumbnail']['url'] ?? null,
            'type' => 'image',
            'mime_type' => $disk->mimeType($path),
            'size' => $disk->size($path),
            'width' => $processed['original_webp']['width'] ?? null,
            'height' => $processed['original_webp']['height'] ?? null,
            'extension' => $extension,
            'folder_id' => $this->folderId,
            'mediable_type' => $this->mediableType,
            'mediable_id' => $this->mediableId,
        ]);

        if ($this->mediableType && $this->mediableId) {
            $mediable = (new $this->mediableType)->find($this->mediableId);
            if ($mediable && method_exists($mediable, 'media')) {
                $mediable->media()->save($media);
            }
        }
    }
}
