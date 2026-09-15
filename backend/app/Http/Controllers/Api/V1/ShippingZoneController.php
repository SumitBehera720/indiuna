<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\ShippingZone\StoreShippingZoneRequest;
use App\Http\Requests\Api\V1\ShippingZone\UpdateShippingZoneRequest;
use App\Http\Resources\ShippingZoneResource;
use App\Models\ShippingZone;
use Illuminate\Http\JsonResponse;

class ShippingZoneController extends Controller
{
    public function __construct(
        private readonly ShippingZone $shippingZone,
    ) {}

    public function index(): JsonResponse
    {
        $zones = $this->shippingZone->with(['methods', 'rates'])->paginate(15);

        return $this->paginated($zones, ShippingZoneResource::class);
    }

    public function show(string $id): JsonResponse
    {
        $zone = $this->shippingZone->with(['methods', 'rates'])->findOrFail($id);

        return $this->success(new ShippingZoneResource($zone));
    }

    public function store(StoreShippingZoneRequest $request): JsonResponse
    {
        $zone = $this->shippingZone->create($request->validated());

        if ($request->has('method_ids')) {
            $zone->methods()->sync($request->input('method_ids'));
        }

        return $this->success(
            new ShippingZoneResource($zone->load('methods')),
            'Shipping zone created successfully',
            201
        );
    }

    public function update(string $id, UpdateShippingZoneRequest $request): JsonResponse
    {
        $zone = $this->shippingZone->findOrFail($id);
        $zone->update($request->validated());

        if ($request->has('method_ids')) {
            $zone->methods()->sync($request->input('method_ids'));
        }

        return $this->success(
            new ShippingZoneResource($zone->fresh()->load('methods')),
            'Shipping zone updated successfully'
        );
    }

    public function destroy(string $id): JsonResponse
    {
        $zone = $this->shippingZone->findOrFail($id);
        $zone->methods()->detach();
        $zone->delete();

        return $this->success(null, 'Shipping zone deleted successfully');
    }
}
