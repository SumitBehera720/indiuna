<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Media\UploadMediaRequest;
use App\Http\Resources\MediaResource;
use App\Services\MediaService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MediaController extends Controller
{
    public function __construct(
        private readonly MediaService $mediaService,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $media = $this->mediaService->getAll($request->input('folder_id'));

        return $this->paginated($media, MediaResource::class);
    }

    public function upload(Request $request): JsonResponse
    {
        $file = $request->file('file') ?? $request->file('image') ?? $request->file('media');

        if (!$file) {
            $allFiles = $request->allFiles();
            if (!empty($allFiles)) {
                $file = reset($allFiles);
                if (is_array($file)) {
                    $file = reset($file);
                }
            }
        }

        if (!$file) {
            if (empty($_FILES) && empty($_POST) && isset($_SERVER['CONTENT_LENGTH']) && (int)$_SERVER['CONTENT_LENGTH'] > 0) {
                return $this->error('File size exceeds server PHP upload limit (upload_max_filesize / post_max_size).', 422);
            }
            return $this->error('No file provided for upload.', 422);
        }

        if (!$file->isValid()) {
            $errCode = $file->getError();
            $errMessages = [
                UPLOAD_ERR_INI_SIZE => 'The uploaded file exceeds the server upload_max_filesize limit.',
                UPLOAD_ERR_FORM_SIZE => 'The uploaded file exceeds the MAX_FILE_SIZE directive in the HTML form.',
                UPLOAD_ERR_PARTIAL => 'The file was only partially uploaded.',
                UPLOAD_ERR_NO_FILE => 'No file was uploaded.',
                UPLOAD_ERR_NO_TMP_DIR => 'Missing a temporary folder on the server.',
                UPLOAD_ERR_CANT_WRITE => 'Failed to write file to disk.',
                UPLOAD_ERR_EXTENSION => 'A PHP extension stopped the file upload.',
            ];
            $msg = $errMessages[$errCode] ?? 'The uploaded file is invalid.';
            return $this->error($msg, 422);
        }

        try {
            $media = $this->mediaService->upload(
                $file,
                $request->input('folder_id'),
                $request->input('mediable_type'),
                $request->input('mediable_id')
            );

            return $this->success(new MediaResource($media), 'File uploaded successfully', 201);
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::error('Media upload error: ' . $e->getMessage());
            return $this->error('Failed to process upload: ' . $e->getMessage(), 500);
        }
    }

    public function bulkUpload(Request $request): JsonResponse
    {
        $request->validate([
            'files' => 'required|array',
            'files.*' => 'required|file|max:102400',
            'folder_id' => 'nullable|string',
        ]);

        $mediaItems = $this->mediaService->bulkUpload(
            $request->file('files'),
            $request->input('folder_id')
        );

        return $this->success(
            MediaResource::collection($mediaItems),
            'Files uploaded successfully',
            201
        );
    }

    public function update(string $id, Request $request): JsonResponse
    {
        $request->validate([
            'name' => 'string|max:255',
            'alt_text' => 'nullable|string|max:255',
            'folder_id' => 'nullable|string',
        ]);

        $media = \App\Models\Media::findOrFail($id);
        $media->update($request->only(['name', 'alt_text', 'folder_id']));

        return $this->success(new MediaResource($media->fresh()), 'Media updated successfully');
    }

    public function destroy(string $id): JsonResponse
    {
        $this->mediaService->delete($id);

        return $this->success(null, 'Media deleted successfully');
    }

    public function crop(string $id, Request $request): JsonResponse
    {
        $request->validate([
            'x' => 'required|numeric',
            'y' => 'required|numeric',
            'width' => 'required|numeric',
            'height' => 'required|numeric',
        ]);

        $media = $this->mediaService->crop($id, $request->only(['x', 'y', 'width', 'height']));

        return $this->success(new MediaResource($media), 'Image cropped successfully');
    }

    public function compress(string $id): JsonResponse
    {
        try {
            $media = $this->mediaService->compress($id);

            return $this->success(new MediaResource($media), 'Image compressed successfully');
        } catch (\RuntimeException $e) {
            return $this->error($e->getMessage(), 400);
        }
    }

    public function rename(string $id, Request $request): JsonResponse
    {
        $request->validate(['name' => 'required|string|max:255']);

        $media = $this->mediaService->rename($id, $request->input('name'));

        return $this->success(new MediaResource($media), 'Media renamed successfully');
    }
}
