<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Warehouse\StoreWarehouseRequest;
use App\Http\Requests\Api\V1\Warehouse\UpdateWarehouseRequest;
use App\Http\Resources\WarehouseResource;
use App\Models\Warehouse;
use Illuminate\Http\JsonResponse;

class WarehouseController extends Controller
{
    public function __construct(
        private readonly Warehouse $warehouse,
    ) {}

    public function index(): JsonResponse
    {
        $warehouses = $this->warehouse->paginate(15);

        return $this->paginated($warehouses, WarehouseResource::class);
    }

    public function show(string $id): JsonResponse
    {
        $warehouse = $this->warehouse->with('inventories')->findOrFail($id);

        return $this->success(new WarehouseResource($warehouse));
    }

    public function store(StoreWarehouseRequest $request): JsonResponse
    {
        $warehouse = $this->warehouse->create($request->validated());

        return $this->success(new WarehouseResource($warehouse), 'Warehouse created successfully', 201);
    }

    public function update(string $id, UpdateWarehouseRequest $request): JsonResponse
    {
        $warehouse = $this->warehouse->findOrFail($id);
        $warehouse->update($request->validated());

        return $this->success(new WarehouseResource($warehouse->fresh()), 'Warehouse updated successfully');
    }

    public function destroy(string $id): JsonResponse
    {
        $warehouse = $this->warehouse->findOrFail($id);
        $warehouse->delete();

        return $this->success(null, 'Warehouse deleted successfully');
    }
}
