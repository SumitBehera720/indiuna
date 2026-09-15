<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Brand\StoreBrandRequest;
use App\Http\Requests\Api\V1\Brand\UpdateBrandRequest;
use App\Http\Resources\BrandResource;
use App\Services\BrandService;
use Illuminate\Http\JsonResponse;

class BrandController extends Controller
{
    public function __construct(
        private readonly BrandService $brandService,
    ) {}

    public function index(): JsonResponse
    {
        $brands = $this->brandService->getAll();

        return $this->success(BrandResource::collection($brands));
    }

    public function show(string $id): JsonResponse
    {
        $brand = $this->brandService->getById($id);

        if (!$brand) {
            return $this->error('Brand not found', 404);
        }

        return $this->success(new BrandResource($brand));
    }

    public function store(StoreBrandRequest $request): JsonResponse
    {
        $brand = $this->brandService->create($request->validated());

        return $this->success(new BrandResource($brand), 'Brand created successfully', 201);
    }

    public function update(string $id, UpdateBrandRequest $request): JsonResponse
    {
        $brand = $this->brandService->update($id, $request->validated());

        return $this->success(new BrandResource($brand), 'Brand updated successfully');
    }

    public function destroy(string $id): JsonResponse
    {
        $this->brandService->delete($id);

        return $this->success(null, 'Brand deleted successfully');
    }

    public function bulkDelete(\Illuminate\Http\Request $request): JsonResponse
    {
        $request->validate(['ids' => 'required|array', 'ids.*' => 'string']);

        foreach ($request->input('ids', []) as $id) {
            $this->brandService->delete($id);
        }

        return $this->success(null, 'Brands deleted successfully');
    }
}
