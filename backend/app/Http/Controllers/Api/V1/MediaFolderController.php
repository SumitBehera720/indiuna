<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Media\StoreMediaFolderRequest;
use App\Http\Requests\Api\V1\Media\UpdateMediaFolderRequest;
use App\Http\Resources\MediaFolderResource;
use App\Models\MediaFolder;
use Illuminate\Http\JsonResponse;

class MediaFolderController extends Controller
{
    public function __construct(
        private readonly MediaFolder $mediaFolder,
    ) {}

    public function index(): JsonResponse
    {
        $folders = $this->mediaFolder->with(['parent', 'children'])->paginate(15);

        return $this->paginated($folders, MediaFolderResource::class);
    }

    public function show(string $id): JsonResponse
    {
        $folder = $this->mediaFolder->with(['parent', 'children', 'media'])->findOrFail($id);

        return $this->success(new MediaFolderResource($folder));
    }

    public function store(StoreMediaFolderRequest $request): JsonResponse
    {
        $folder = $this->mediaFolder->create($request->validated());

        return $this->success(new MediaFolderResource($folder), 'Folder created successfully', 201);
    }

    public function update(string $id, UpdateMediaFolderRequest $request): JsonResponse
    {
        $folder = $this->mediaFolder->findOrFail($id);
        $folder->update($request->validated());

        return $this->success(new MediaFolderResource($folder->fresh()), 'Folder updated successfully');
    }

    public function destroy(string $id): JsonResponse
    {
        $folder = $this->mediaFolder->withCount('media')->findOrFail($id);

        if ($folder->media_count > 0) {
            return $this->error('Cannot delete folder with media files', 409);
        }

        $folder->children()->update(['parent_id' => $folder->parent_id]);
        $folder->delete();

        return $this->success(null, 'Folder deleted successfully');
    }
}
