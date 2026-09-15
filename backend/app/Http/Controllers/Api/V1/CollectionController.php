<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Collection\AssignProductsRequest;
use App\Http\Requests\Api\V1\Collection\StoreCollectionRequest;
use App\Http\Requests\Api\V1\Collection\UpdateCollectionRequest;
use App\Http\Resources\CollectionResource;
use App\Services\CollectionService;
use Illuminate\Http\JsonResponse;

class CollectionController extends Controller
{
    public function __construct(
        private readonly CollectionService $collectionService,
    ) {}

    public function index(): JsonResponse
    {
        $collections = $this->collectionService->getAll();

        return $this->success(CollectionResource::collection($collections));
    }

    public function show(string $id): JsonResponse
    {
        $collection = $this->collectionService->getById($id);

        if (!$collection) {
            return $this->error('Collection not found', 404);
        }

        return $this->success(new CollectionResource($collection));
    }

    public function store(StoreCollectionRequest $request): JsonResponse
    {
        $collection = $this->collectionService->create($request->validated());

        return $this->success(new CollectionResource($collection), 'Collection created successfully', 201);
    }

    public function update(string $id, UpdateCollectionRequest $request): JsonResponse
    {
        $collection = $this->collectionService->update($id, $request->validated());

        return $this->success(new CollectionResource($collection), 'Collection updated successfully');
    }

    public function destroy(string $id): JsonResponse
    {
        $this->collectionService->delete($id);

        return $this->success(null, 'Collection deleted successfully');
    }

    public function assignProducts(string $id, AssignProductsRequest $request): JsonResponse
    {
        $collection = $this->collectionService->assignProducts($id, $request->input('product_ids', []));

        return $this->success(new CollectionResource($collection), 'Products assigned successfully');
    }

    public function removeProduct(string $id, \Illuminate\Http\Request $request): JsonResponse
    {
        $request->validate(['product_id' => 'required|string']);

        $collection = $this->collectionService->removeProduct($id, $request->input('product_id'));

        return $this->success(new CollectionResource($collection), 'Product removed successfully');
    }
}
