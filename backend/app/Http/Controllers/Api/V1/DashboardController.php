<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Services\AnalyticsService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function __construct(
        private readonly AnalyticsService $analyticsService,
    ) {}

    public function stats(): JsonResponse
    {
        $metrics = $this->analyticsService->getDashboardMetrics();

        return $this->success($metrics->toArray());
    }

    public function revenueChart(Request $request): JsonResponse
    {
        $data = $this->analyticsService->revenueChart(
            $request->input('period', 'monthly'),
            $request->integer('months', 12)
        );

        return $this->success($data);
    }

    public function salesChart(Request $request): JsonResponse
    {
        $data = $this->analyticsService->salesChart(
            $request->input('period', 'monthly'),
            $request->integer('months', 12)
        );

        return $this->success($data);
    }

    public function ordersChart(Request $request): JsonResponse
    {
        $data = $this->analyticsService->ordersChart(
            $request->input('period', 'daily'),
            $request->integer('days', 30)
        );

        return $this->success($data);
    }

    public function topProducts(Request $request): JsonResponse
    {
        $data = $this->analyticsService->topProducts($request->integer('limit', 10));

        return $this->success($data);
    }

    public function topCategories(Request $request): JsonResponse
    {
        $data = $this->analyticsService->topCategories($request->integer('limit', 10));

        return $this->success($data);
    }

    public function topCustomers(Request $request): JsonResponse
    {
        $data = $this->analyticsService->topCustomers($request->integer('limit', 10));

        return $this->success($data);
    }

    public function latestOrders(): JsonResponse
    {
        $orders = \App\Models\Order::with(['customer', 'items'])
            ->orderByDesc('created_at')
            ->limit(10)
            ->get();

        return $this->success($orders);
    }

    public function latestReviews(): JsonResponse
    {
        $reviews = \App\Models\Review::with(['customer', 'product'])
            ->orderByDesc('created_at')
            ->limit(10)
            ->get();

        return $this->success($reviews);
    }

    public function inventoryAlerts(): JsonResponse
    {
        $alerts = app(\App\Services\InventoryService::class)->getAlerts();

        return $this->success($alerts);
    }

    public function analytics(Request $request): JsonResponse
    {
        $from = $request->input('from', now()->subMonth()->toDateString());
        $to = $request->input('to', now()->toDateString());

        return $this->success([
            'revenue' => $this->analyticsService->revenueChart('daily', 30),
            'orders' => $this->analyticsService->ordersChart('daily', 30),
            'conversion_rate' => $this->analyticsService->conversionRate($from, $to),
            'top_products' => $this->analyticsService->topProducts(5),
            'top_categories' => $this->analyticsService->topCategories(5),
        ]);
    }
}
