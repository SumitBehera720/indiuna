<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Supplier\StoreSupplierRequest;
use App\Http\Requests\Api\V1\Supplier\UpdateSupplierRequest;
use App\Http\Resources\SupplierResource;
use App\Models\Supplier;
use Illuminate\Http\JsonResponse;

class SupplierController extends Controller
{
    public function __construct(
        private readonly Supplier $supplier,
    ) {}

    public function index(): JsonResponse
    {
        $suppliers = $this->supplier->paginate(15);

        return $this->paginated($suppliers, SupplierResource::class);
    }

    public function show(string $id): JsonResponse
    {
        $supplier = $this->supplier->findOrFail($id);

        return $this->success(new SupplierResource($supplier));
    }

    public function store(StoreSupplierRequest $request): JsonResponse
    {
        $supplier = $this->supplier->create($request->validated());

        return $this->success(new SupplierResource($supplier), 'Supplier created successfully', 201);
    }

    public function update(string $id, UpdateSupplierRequest $request): JsonResponse
    {
        $supplier = $this->supplier->findOrFail($id);
        $supplier->update($request->validated());

        return $this->success(new SupplierResource($supplier->fresh()), 'Supplier updated successfully');
    }

    public function destroy(string $id): JsonResponse
    {
        $supplier = $this->supplier->findOrFail($id);
        $supplier->delete();

        return $this->success(null, 'Supplier deleted successfully');
    }
}
