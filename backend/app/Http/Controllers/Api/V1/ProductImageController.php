<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Product\UploadImageRequest;
use App\Http\Resources\ProductImageResource;
use App\Models\Product;
use App\Models\ProductImage;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;

class ProductImageController extends Controller
{
    public function index(string $productId): JsonResponse
    {
        $product = Product::findOrFail($productId);

        return $this->success(ProductImageResource::collection($product->images()->orderBy('sort_order')->get()));
    }

    public function store(string $productId, UploadImageRequest $request): JsonResponse
    {
        $product = Product::findOrFail($productId);

        $images = [];
        $files = $request->hasFile('images') ? $request->file('images') : [$request->file('image')];

        foreach ($files as $file) {
            $path = $file->store("products/{$productId}", 'public');

            $maxSort = $product->images()->max('sort_order') ?? 0;

            $image = $product->images()->create([
                'url' => Storage::disk('public')->url($path),
                'path' => $path,
                'name' => $file->getClientOriginalName(),
                'size' => $file->getSize(),
                'mime_type' => $file->getMimeType(),
                'sort_order' => $maxSort + 1,
                'is_primary' => $product->images()->count() === 0,
            ]);

            $images[] = new ProductImageResource($image);
        }

        return $this->success(
            count($images) === 1 ? $images[0] : $images,
            'Image(s) uploaded successfully',
            201
        );
    }

    public function destroy(string $productId, string $id): JsonResponse
    {
        $image = ProductImage::where('product_id', $productId)->findOrFail($id);

        Storage::disk('public')->delete($image->path);
        $image->delete();

        return $this->success(null, 'Image deleted successfully');
    }

    public function reorder(\Illuminate\Http\Request $request): JsonResponse
    {
        $request->validate([
            'images' => 'required|array',
            'images.*.id' => 'required|string',
            'images.*.sort_order' => 'required|integer',
        ]);

        foreach ($request->input('images', []) as $data) {
            ProductImage::where('id', $data['id'])->update(['sort_order' => $data['sort_order']]);
        }

        return $this->success(null, 'Images reordered successfully');
    }

    public function setPrimary(string $productId, string $id): JsonResponse
    {
        $product = Product::findOrFail($productId);

        $product->images()->update(['is_primary' => false]);

        $image = ProductImage::where('product_id', $productId)->findOrFail($id);
        $image->update(['is_primary' => true]);

        return $this->success(new ProductImageResource($image->fresh()), 'Primary image set successfully');
    }
}
