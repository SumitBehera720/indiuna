<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\FlashSale\StoreFlashSaleRequest;
use App\Http\Requests\Api\V1\FlashSale\UpdateFlashSaleRequest;
use App\Http\Resources\FlashSaleResource;
use App\Models\FlashSale;
use Illuminate\Http\JsonResponse;

class FlashSaleController extends Controller
{
    public function __construct(
        private readonly FlashSale $flashSale,
    ) {}

    public function index(): JsonResponse
    {
        $flashSales = $this->flashSale->with('products')->paginate(15);

        return $this->paginated($flashSales, FlashSaleResource::class);
    }

    public function show(string $id): JsonResponse
    {
        $flashSale = $this->flashSale->with('products')->findOrFail($id);

        return $this->success(new FlashSaleResource($flashSale));
    }

    public function store(StoreFlashSaleRequest $request): JsonResponse
    {
        $data = $request->validated();
        $flashSale = $this->flashSale->create($data);

        if (!empty($data['product_ids'])) {
            $products = [];
            foreach ($data['product_ids'] as $productId) {
                $products[$productId] = [
                    'discount_price' => $data['discount_price'] ?? null,
                    'quantity_limit' => $data['quantity_limit'] ?? null,
                ];
            }
            $flashSale->products()->sync($products);
        }

        return $this->success(
            new FlashSaleResource($flashSale->load('products')),
            'Flash sale created successfully',
            201
        );
    }

    public function update(string $id, UpdateFlashSaleRequest $request): JsonResponse
    {
        $flashSale = $this->flashSale->findOrFail($id);
        $data = $request->validated();
        $flashSale->update($data);

        if (!empty($data['product_ids'])) {
            $products = [];
            foreach ($data['product_ids'] as $productId) {
                $products[$productId] = [
                    'discount_price' => $data['discount_price'] ?? null,
                    'quantity_limit' => $data['quantity_limit'] ?? null,
                ];
            }
            $flashSale->products()->sync($products);
        }

        return $this->success(
            new FlashSaleResource($flashSale->fresh()->load('products')),
            'Flash sale updated successfully'
        );
    }

    public function destroy(string $id): JsonResponse
    {
        $flashSale = $this->flashSale->findOrFail($id);
        $flashSale->products()->detach();
        $flashSale->delete();

        return $this->success(null, 'Flash sale deleted successfully');
    }

    public function addProducts(string $id, \Illuminate\Http\Request $request): JsonResponse
    {
        $request->validate([
            'product_ids' => 'required|array',
            'product_ids.*' => 'string',
            'discount_price' => 'nullable|numeric',
            'quantity_limit' => 'nullable|integer',
        ]);

        $flashSale = $this->flashSale->findOrFail($id);

        $syncData = [];
        foreach ($request->input('product_ids', []) as $productId) {
            $syncData[$productId] = [
                'discount_price' => $request->input('discount_price'),
                'quantity_limit' => $request->input('quantity_limit'),
            ];
        }
        $flashSale->products()->syncWithoutDetaching($syncData);

        return $this->success(
            new FlashSaleResource($flashSale->fresh()->load('products')),
            'Products added to flash sale'
        );
    }

    public function removeProduct(string $id, \Illuminate\Http\Request $request): JsonResponse
    {
        $request->validate(['product_id' => 'required|string']);

        $flashSale = $this->flashSale->findOrFail($id);
        $flashSale->products()->detach($request->input('product_id'));

        return $this->success(
            new FlashSaleResource($flashSale->fresh()->load('products')),
            'Product removed from flash sale'
        );
    }
}
