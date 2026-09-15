<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Product\StoreVariantRequest;
use App\Http\Requests\Api\V1\Product\UpdateVariantRequest;
use App\Http\Resources\ProductVariantResource;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Services\ProductService;
use Illuminate\Http\JsonResponse;

class ProductVariantController extends Controller
{
    public function __construct(
        private readonly ProductService $productService,
    ) {}

    public function index(string $productId): JsonResponse
    {
        $product = $this->productService->getById($productId);

        if (!$product) {
            return $this->error('Product not found', 404);
        }

        return $this->success(ProductVariantResource::collection($product->variants));
    }

    public function store(string $productId, StoreVariantRequest $request): JsonResponse
    {
        $product = Product::findOrFail($productId);

        $variant = $product->variants()->create($request->validated());

        return $this->success(new ProductVariantResource($variant), 'Variant created successfully', 201);
    }

    public function update(string $productId, string $id, UpdateVariantRequest $request): JsonResponse
    {
        $variant = ProductVariant::where('product_id', $productId)->findOrFail($id);
        $variant->update($request->validated());

        return $this->success(new ProductVariantResource($variant->fresh()), 'Variant updated successfully');
    }

    public function destroy(string $productId, string $id): JsonResponse
    {
        $variant = ProductVariant::where('product_id', $productId)->findOrFail($id);
        $variant->delete();

        return $this->success(null, 'Variant deleted successfully');
    }

    public function bulkUpdate(\Illuminate\Http\Request $request): JsonResponse
    {
        $request->validate([
            'variants' => 'required|array',
            'variants.*.id' => 'required|string',
            'variants.*.price' => 'sometimes|numeric',
            'variants.*.stock' => 'sometimes|integer',
            'variants.*.is_active' => 'sometimes|boolean',
        ]);

        foreach ($request->input('variants', []) as $data) {
            ProductVariant::where('id', $data['id'])->update($data);
        }

        return $this->success(null, 'Variants updated successfully');
    }
}
