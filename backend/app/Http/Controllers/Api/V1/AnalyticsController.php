<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Services\AnalyticsService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AnalyticsController extends Controller
{
    public function __construct(
        private readonly AnalyticsService $analyticsService,
    ) {}

    public function overview(Request $request): JsonResponse
    {
        $metrics = $this->analyticsService->getDashboardMetrics();

        return $this->success($metrics->toArray());
    }

    public function revenue(Request $request): JsonResponse
    {
        $data = $this->analyticsService->revenueChart(
            $request->input('period', 'monthly'),
            $request->integer('months', 12)
        );

        return $this->success([
            'chart_data' => $data,
            'metrics' => $this->analyticsService->getDashboardMetrics()->toArray(),
        ]);
    }

    public function orders(Request $request): JsonResponse
    {
        $data = $this->analyticsService->ordersChart(
            $request->input('period', 'daily'),
            $request->integer('days', 30)
        );

        return $this->success([
            'chart_data' => $data,
            'total_orders' => \App\Models\Order::count(),
            'pending_orders' => \App\Models\Order::where('status', 'pending')->count(),
            'completed_orders' => \App\Models\Order::where('status', 'delivered')->count(),
            'cancelled_orders' => \App\Models\Order::where('status', 'cancelled')->count(),
        ]);
    }

    public function customers(Request $request): JsonResponse
    {
        $total = \App\Models\Customer::count();
        $newThisMonth = \App\Models\Customer::whereMonth('created_at', now()->month)
            ->whereYear('created_at', now()->year)
            ->count();

        return $this->success([
            'total_customers' => $total,
            'new_this_month' => $newThisMonth,
            'top_customers' => $this->analyticsService->topCustomers(10),
        ]);
    }

    public function products(Request $request): JsonResponse
    {
        return $this->success([
            'total_products' => \App\Models\Product::count(),
            'top_selling' => $this->analyticsService->topProducts(10),
            'top_categories' => $this->analyticsService->topCategories(10),
        ]);
    }

    public function conversion(Request $request): JsonResponse
    {
        $from = $request->input('from', now()->subMonth()->toDateString());
        $to = $request->input('to', now()->toDateString());

        return $this->success([
            'rate' => $this->analyticsService->conversionRate($from, $to),
            'period' => ['from' => $from, 'to' => $to],
        ]);
    }

    public function retention(Request $request): JsonResponse
    {
        $months = $request->integer('months', 12);

        $data = [];
        for ($i = $months - 1; $i >= 0; $i--) {
            $month = now()->subMonths($i);
            $start = $month->copy()->startOfMonth();
            $end = $month->copy()->endOfMonth();

            $newCustomers = \App\Models\Customer::whereBetween('created_at', [$start, $end])->count();
            $returningCustomers = \App\Models\Order::whereBetween('created_at', [$start, $end])
                ->distinct('customer_id')
                ->count();

            $data[] = [
                'month' => $month->format('Y-m'),
                'new_customers' => $newCustomers,
                'returning_customers' => $returningCustomers,
                'retention_rate' => $newCustomers > 0
                    ? round(($returningCustomers / $newCustomers) * 100, 2)
                    : 0,
            ];
        }

        return $this->success($data);
    }
}
