<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProductResource;
use App\Services\ProductService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SearchController extends Controller
{
    public function __construct(
        private readonly ProductService $productService,
    ) {}

    public function search(Request $request): JsonResponse
    {
        $request->validate(['q' => 'required|string|min:2']);

        $products = $this->productService->search($request->input('q'));

        return $this->success([
            'products' => ProductResource::collection($products),
        ]);
    }

    public function globalSearch(Request $request): JsonResponse
    {
        $request->validate(['q' => 'required|string|min:2']);

        $query = $request->input('q');

        $products = \App\Models\Product::where('name', 'LIKE', "%{$query}%")
            ->orWhere('sku', 'LIKE', "%{$query}%")
            ->limit(10)
            ->get();

        $orders = \App\Models\Order::where('order_number', 'LIKE', "%{$query}%")
            ->orWhereHas('customer', fn($q) => $q->where('first_name', 'LIKE', "%{$query}%")
                ->orWhere('last_name', 'LIKE', "%{$query}%")
                ->orWhere('email', 'LIKE', "%{$query}%"))
            ->limit(10)
            ->get();

        $customers = \App\Models\Customer::where('first_name', 'LIKE', "%{$query}%")
            ->orWhere('last_name', 'LIKE', "%{$query}%")
            ->orWhere('email', 'LIKE', "%{$query}%")
            ->orWhere('phone', 'LIKE', "%{$query}%")
            ->limit(10)
            ->get();

        $categories = \App\Models\Category::where('name', 'LIKE', "%{$query}%")
            ->limit(10)
            ->get();

        $coupons = \App\Models\Coupon::where('code', 'LIKE', "%{$query}%")
            ->orWhere('name', 'LIKE', "%{$query}%")
            ->limit(10)
            ->get();

        $blogs = \App\Models\Blog::where('title', 'LIKE', "%{$query}%")
            ->orWhere('content', 'LIKE', "%{$query}%")
            ->limit(10)
            ->get();

        $media = \App\Models\Media::where('name', 'LIKE', "%{$query}%")
            ->limit(10)
            ->get();

        $pages = \App\Models\Page::where('title', 'LIKE', "%{$query}%")
            ->orWhere('content', 'LIKE', "%{$query}%")
            ->limit(10)
            ->get();

        return $this->success([
            'products' => ProductResource::collection($products),
            'orders' => $orders,
            'customers' => $customers,
            'categories' => $categories,
            'coupons' => $coupons,
            'blogs' => $blogs,
            'media' => $media,
            'pages' => $pages,
        ]);
    }
}
