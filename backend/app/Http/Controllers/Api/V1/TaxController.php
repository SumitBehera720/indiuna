<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Tax\StoreTaxRateRequest;
use App\Http\Requests\Api\V1\Tax\UpdateTaxRateRequest;
use App\Http\Resources\TaxRateResource;
use App\Models\TaxRate;
use Illuminate\Http\JsonResponse;

class TaxController extends Controller
{
    public function __construct(
        private readonly TaxRate $taxRate,
    ) {}

    public function index(): JsonResponse
    {
        $rates = $this->taxRate->orderBy('priority')->paginate(15);

        return $this->paginated($rates, TaxRateResource::class);
    }

    public function show(string $id): JsonResponse
    {
        $rate = $this->taxRate->findOrFail($id);

        return $this->success(new TaxRateResource($rate));
    }

    public function store(StoreTaxRateRequest $request): JsonResponse
    {
        $rate = $this->taxRate->create($request->validated());

        return $this->success(new TaxRateResource($rate), 'Tax rate created successfully', 201);
    }

    public function update(string $id, UpdateTaxRateRequest $request): JsonResponse
    {
        $rate = $this->taxRate->findOrFail($id);
        $rate->update($request->validated());

        return $this->success(new TaxRateResource($rate->fresh()), 'Tax rate updated successfully');
    }

    public function destroy(string $id): JsonResponse
    {
        $rate = $this->taxRate->findOrFail($id);
        $rate->delete();

        return $this->success(null, 'Tax rate deleted successfully');
    }
}
