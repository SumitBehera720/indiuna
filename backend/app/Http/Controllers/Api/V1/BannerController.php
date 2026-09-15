<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Banner\StoreBannerRequest;
use App\Http\Requests\Api\V1\Banner\UpdateBannerRequest;
use App\Http\Resources\BannerResource;
use App\Models\Banner;
use Illuminate\Http\JsonResponse;

class BannerController extends Controller
{
    public function __construct(
        private readonly Banner $banner,
    ) {}

    public function index(): JsonResponse
    {
        $banners = $this->banner->orderBy('sort_order')->paginate(15);

        return $this->paginated($banners, BannerResource::class);
    }

    public function show(string $id): JsonResponse
    {
        $banner = $this->banner->findOrFail($id);

        return $this->success(new BannerResource($banner));
    }

    public function store(StoreBannerRequest $request): JsonResponse
    {
        $banner = $this->banner->create($request->validated());

        return $this->success(new BannerResource($banner), 'Banner created successfully', 201);
    }

    public function update(string $id, UpdateBannerRequest $request): JsonResponse
    {
        $banner = $this->banner->findOrFail($id);
        $banner->update($request->validated());

        return $this->success(new BannerResource($banner->fresh()), 'Banner updated successfully');
    }

    public function destroy(string $id): JsonResponse
    {
        $banner = $this->banner->findOrFail($id);
        $banner->delete();

        return $this->success(null, 'Banner deleted successfully');
    }
}
