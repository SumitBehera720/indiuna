<?php

namespace App\Http\Controllers\Api\V1;

use App\DTOs\Product\CreateProductDTO;
use App\DTOs\Product\ProductFilterDTO;
use App\DTOs\Product\UpdateProductDTO;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Product\BulkProductRequest;
use App\Http\Requests\Api\V1\Product\ImportProductRequest;
use App\Http\Requests\Api\V1\Product\ProductFilterRequest;
use App\Http\Requests\Api\V1\Product\StoreProductRequest;
use App\Http\Requests\Api\V1\Product\UpdateProductRequest;
use App\Http\Resources\ProductCollection;
use App\Http\Resources\ProductResource;
use App\Jobs\ImportProducts;
use App\Services\ProductService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function __construct(
        private readonly ProductService $productService,
    ) {}

    public function index(ProductFilterRequest $request): JsonResponse
    {
        $filters = ProductFilterDTO::fromArray($request->validated());
        $products = $this->productService->getAll($filters);

        return $this->paginated($products, ProductResource::class);
    }

    public function show(string $id): JsonResponse
    {
        $product = $this->productService->getById($id);

        if (!$product) {
            return $this->error('Product not found', 404);
        }

        return $this->success(new ProductResource($product));
    }

    public function store(StoreProductRequest $request): JsonResponse
    {
        $dto = CreateProductDTO::fromArray($request->validated());
        $product = $this->productService->create($dto);

        return $this->success(new ProductResource($product), 'Product created successfully', 201);
    }

    public function update(string $id, UpdateProductRequest $request): JsonResponse
    {
        $dto = UpdateProductDTO::fromArray($request->validated());
        $product = $this->productService->update($id, $dto);

        return $this->success(new ProductResource($product), 'Product updated successfully');
    }

    public function destroy(string $id): JsonResponse
    {
        $this->productService->delete($id);

        return $this->success(null, 'Product deleted successfully');
    }

    public function bulkUpdateStatus(BulkProductRequest $request): JsonResponse
    {
        $this->productService->bulkUpdateStatus(
            $request->input('ids', []),
            $request->input('status')
        );

        return $this->success(null, 'Products status updated successfully');
    }

    public function bulkDelete(Request $request): JsonResponse
    {
        $request->validate(['ids' => 'required|array', 'ids.*' => 'string']);

        foreach ($request->input('ids', []) as $id) {
            $this->productService->delete($id);
        }

        return $this->success(null, 'Products deleted successfully');
    }

    public function duplicate(string $id): JsonResponse
    {
        $product = $this->productService->duplicate($id);

        return $this->success(new ProductResource($product), 'Product duplicated successfully');
    }

    public function restore(string $id): JsonResponse
    {
        $this->productService->restore($id);

        return $this->success(null, 'Product restored successfully');
    }

    public function trashed(): JsonResponse
    {
        $products = \App\Models\Product::onlyTrashed()->paginate(15);

        return $this->paginated($products, ProductResource::class);
    }

    public function activity(string $id): JsonResponse
    {
        $product = $this->productService->getById($id);

        if (!$product) {
            return $this->error('Product not found', 404);
        }

        return $this->success($product->activities()->get());
    }

    public function import(ImportProductRequest $request): JsonResponse
    {
        ImportProducts::dispatch($request->file('file')->path());

        return $this->success(null, 'Products import queued successfully');
    }

    public function export(Request $request): JsonResponse
    {
        $csv = $this->productService->export();

        return response()->streamDownload(function () use ($csv) {
            echo $csv;
        }, 'products-export.csv', [
            'Content-Type' => 'text/csv',
        ]);
    }

    public function search(Request $request): JsonResponse
    {
        $request->validate(['q' => 'required|string|min:2']);

        $products = $this->productService->search($request->input('q'));

        return $this->success(ProductResource::collection($products));
    }

    public function notifyBackInStock(string $id, Request $request): JsonResponse
    {
        $request->validate([
            'email' => 'required|email',
            'variant_id' => 'nullable|string',
        ]);

        $product = \App\Models\Product::findOrFail($id);

        \App\Models\BackInStockSubscription::firstOrCreate([
            'product_id' => $product->id,
            'email' => $request->input('email'),
            'variant_id' => $request->input('variant_id'),
        ], [
            'user_id' => auth('sanctum')->id(),
        ]);

        return $this->success(null, 'Thank you! We will notify you via email as soon as this product is back in stock.');
    }
}
