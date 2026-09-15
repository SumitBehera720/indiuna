<?php
declare(strict_types=1);

namespace App\Services;

use App\Contracts\Repositories\MediaRepositoryInterface;
use App\Enums\MediaType;
use App\Helpers\ImageHelper;
use Illuminate\Http\UploadedFile;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Intervention\Image\ImageManager;
use Intervention\Image\Drivers\Gd\Driver;

class MediaService
{
    public function __construct(
        private readonly MediaRepositoryInterface $mediaRepository,
    ) {}

    public function getAll(?string $folderId = null): LengthAwarePaginator
    {
        return $this->mediaRepository->paginate(30);
    }

    public function upload(UploadedFile $file, ?string $folderId = null, ?string $mediableType = null, ?string $mediableId = null): Model
    {
        return DB::transaction(function () use ($file, $folderId, $mediableType, $mediableId) {
            $extension = strtolower($file->getClientOriginalExtension());
            $fileName = pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME);
            $safeName = Str::slug($fileName) . '-' . now()->timestamp . '.' . $extension;
            $path = $file->storeAs('media/' . ($folderId ?? 'general'), $safeName, 'public');

            $type = in_array($extension, ['jpg', 'jpeg', 'png', 'webp', 'avif', 'gif', 'svg'])
                ? MediaType::Image
                : (in_array($extension, ['mp4', 'webm', 'ogg', 'avi', 'mov'])
                    ? MediaType::Video
                    : MediaType::Document);

            $url = Storage::disk('public')->url($path);
            $thumbnailUrl = null;

            if ($type === MediaType::Image && !in_array($extension, ['svg', 'gif'])) {
                try {
                    $thumbPath = 'media/' . ($folderId ?? 'general') . '/thumb_' . $safeName;
                    $manager = new ImageManager(new Driver());
                    $img = $manager->read($file->getRealPath());
                    $img->cover(300, 300);
                    Storage::disk('public')->put($thumbPath, (string) $img->encodeByExtension($extension));
                    $thumbnailUrl = Storage::disk('public')->url($thumbPath);

                    $webpName = pathinfo($safeName, PATHINFO_FILENAME) . '.webp';
                    $webpPath = 'media/' . ($folderId ?? 'general') . '/' . $webpName;
                    $webpImg = $manager->read($file->getRealPath());
                    Storage::disk('public')->put($webpPath, (string) $webpImg->toWebp(80));
                } catch (\Throwable $e) {
                    \Illuminate\Support\Facades\Log::warning('MediaService image resize warning: ' . $e->getMessage());
                }
            }

            $size = $file->getSize();

            return $this->mediaRepository->create([
                'name' => $fileName,
                'file_name' => $safeName,
                'path' => $path,
                'url' => $url,
                'thumbnail_url' => $thumbnailUrl,
                'type' => $type->value,
                'mime_type' => $file->getMimeType(),
                'size' => $size,
                'extension' => $extension,
                'folder_id' => $folderId,
                'mediable_type' => $mediableType,
                'mediable_id' => $mediableId,
            ]);
        });
    }

    public function bulkUpload(array $files, ?string $folderId = null): Collection
    {
        $mediaItems = new Collection();

        DB::transaction(function () use ($files, $folderId, &$mediaItems) {
            foreach ($files as $file) {
                $mediaItems->push($this->upload($file, $folderId));
            }
        });

        return $mediaItems;
    }

    public function delete(string $id): bool
    {
        return DB::transaction(function () use ($id) {
            $media = $this->mediaRepository->findOrFail($id);

            Storage::disk('public')->delete($media->path);

            if ($media->thumbnail_url) {
                $thumbPath = str_replace(Storage::disk('public')->url(''), '', $media->thumbnail_url);
                Storage::disk('public')->delete($thumbPath);
            }

            return $this->mediaRepository->delete($media);
        });
    }

    public function crop(string $id, array $coordinates): Model
    {
        $media = $this->mediaRepository->findOrFail($id);
        $disk = Storage::disk('public');

        $manager = new ImageManager(new Driver());
        $img = $manager->read($disk->path($media->path));
        $img->crop(
            (int) $coordinates['width'],
            (int) $coordinates['height'],
            (int) $coordinates['x'],
            (int) $coordinates['y']
        );
        $disk->put($media->path, (string) $img->encodeByExtension($media->extension));

        return $media->fresh();
    }

    public function rename(string $id, string $name): Model
    {
        $media = $this->mediaRepository->findOrFail($id);
        return $this->mediaRepository->update($media, ['name' => $name]);
    }

    public function compress(string $id): Model
    {
        $media = $this->mediaRepository->findOrFail($id);
        $disk = Storage::disk('public');

        if ($media->type !== MediaType::Image->value) {
            throw new \RuntimeException('Only images can be compressed');
        }

        $manager = new ImageManager(new Driver());
        $img = $manager->read($disk->path($media->path));
        $disk->put($media->path, (string) $img->toWebp(70));

        return $media->fresh();
    }
}
