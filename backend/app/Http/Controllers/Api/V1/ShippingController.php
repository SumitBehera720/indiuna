<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Shipping\StoreShippingMethodRequest;
use App\Http\Requests\Api\V1\Shipping\UpdateShippingMethodRequest;
use App\Http\Resources\ShippingMethodResource;
use App\Models\ShippingMethod;
use Illuminate\Http\JsonResponse;

class ShippingController extends Controller
{
    public function __construct(
        private readonly ShippingMethod $shippingMethod,
    ) {}

    public function index(): JsonResponse
    {
        $methods = $this->shippingMethod->with('zones')->paginate(15);

        return $this->paginated($methods, ShippingMethodResource::class);
    }

    public function show(string $id): JsonResponse
    {
        $method = $this->shippingMethod->with(['zones', 'rates'])->findOrFail($id);

        return $this->success(new ShippingMethodResource($method));
    }

    public function store(StoreShippingMethodRequest $request): JsonResponse
    {
        $method = $this->shippingMethod->create($request->validated());

        return $this->success(
            new ShippingMethodResource($method),
            'Shipping method created successfully',
            201
        );
    }

    public function update(string $id, UpdateShippingMethodRequest $request): JsonResponse
    {
        $method = $this->shippingMethod->findOrFail($id);
        $method->update($request->validated());

        return $this->success(
            new ShippingMethodResource($method->fresh()),
            'Shipping method updated successfully'
        );
    }

    public function destroy(string $id): JsonResponse
    {
        $method = $this->shippingMethod->findOrFail($id);
        $method->delete();

        return $this->success(null, 'Shipping method deleted successfully');
    }
}
