<?php
declare(strict_types=1);

namespace App\Services;

use App\Contracts\Repositories\OrderRepositoryInterface;
use App\Contracts\Repositories\ProductRepositoryInterface;
use App\Contracts\Repositories\CustomerRepositoryInterface;
use App\Contracts\Repositories\CouponRepositoryInterface;
use App\Contracts\Repositories\InventoryRepositoryInterface;
use App\DTOs\Analytics\DashboardMetricsDTO;
use App\Enums\OrderStatus;
use Illuminate\Support\Facades\DB;

class AnalyticsService
{
    public function __construct(
        private readonly OrderRepositoryInterface $orderRepository,
        private readonly ProductRepositoryInterface $productRepository,
        private readonly CustomerRepositoryInterface $customerRepository,
        private readonly CouponRepositoryInterface $couponRepository,
        private readonly InventoryRepositoryInterface $inventoryRepository,
    ) {}

    public function getDashboardMetrics(): DashboardMetricsDTO
    {
        $totalRevenue = \App\Models\Order::query()->toBase()
            ->whereNotIn('status', [OrderStatus::Cancelled->value, OrderStatus::Refunded->value])
            ->sum('grand_total');

        $revenueToday = \App\Models\Order::query()->toBase()
            ->whereDate('created_at', today())
            ->whereNotIn('status', [OrderStatus::Cancelled->value, OrderStatus::Refunded->value])
            ->sum('grand_total');

        $revenueYesterday = \App\Models\Order::query()->toBase()
            ->whereDate('created_at', today()->subDay())
            ->whereNotIn('status', [OrderStatus::Cancelled->value, OrderStatus::Refunded->value])
            ->sum('grand_total');

        $revenueThisMonth = \App\Models\Order::query()->toBase()
            ->whereMonth('created_at', now()->month)
            ->whereYear('created_at', now()->year)
            ->whereNotIn('status', [OrderStatus::Cancelled->value, OrderStatus::Refunded->value])
            ->sum('grand_total');

        $revenueThisYear = \App\Models\Order::query()->toBase()
            ->whereYear('created_at', now()->year)
            ->whereNotIn('status', [OrderStatus::Cancelled->value, OrderStatus::Refunded->value])
            ->sum('grand_total');

        $ordersToday = \App\Models\Order::query()->toBase()
            ->whereDate('created_at', today())
            ->count();

        $ordersPending = \App\Models\Order::query()->toBase()
            ->where('status', OrderStatus::Pending->value)
            ->count();

        $ordersCompleted = \App\Models\Order::query()->toBase()
            ->where('status', OrderStatus::Delivered->value)
            ->count();

        $ordersCancelled = \App\Models\Order::query()->toBase()
            ->where('status', OrderStatus::Cancelled->value)
            ->count();

        $totalCustomers = $this->customerRepository->count();

        $newCustomers = \App\Models\Customer::query()->toBase()
            ->whereMonth('created_at', now()->month)
            ->whereYear('created_at', now()->year)
            ->count();

        $totalProducts = $this->productRepository->count();

        $lowStockProducts = $this->inventoryRepository->getAlerts()->count();

        $outOfStock = DB::table('product_variants')
            ->where('stock', '<=', 0)
            ->count();

        $activeCoupons = $this->couponRepository->getValidCoupons()->count();

        $totalVisitors = DB::table('analytics_visits')
            ->whereDate('created_at', today())
            ->count() ?: 1;

        $totalOrdersToday = \App\Models\Order::query()->toBase()
            ->whereDate('created_at', today())
            ->count();

        $conversionRate = $totalVisitors > 0
            ? round(($totalOrdersToday / $totalVisitors) * 100, 2)
            : 0;

        $averageOrderValue = \App\Models\Order::query()->toBase()
            ->whereNotIn('status', [OrderStatus::Cancelled->value, OrderStatus::Refunded->value])
            ->avg('grand_total');

        $customerLifetimeValue = $totalCustomers > 0
            ? $totalRevenue / $totalCustomers
            : 0;

        return DashboardMetricsDTO::fromArray([
            'total_revenue' => (float) $totalRevenue,
            'revenue_today' => (float) $revenueToday,
            'revenue_yesterday' => (float) $revenueYesterday,
            'revenue_this_month' => (float) $revenueThisMonth,
            'revenue_this_year' => (float) $revenueThisYear,
            'orders_today' => (int) $ordersToday,
            'orders_pending' => (int) $ordersPending,
            'orders_completed' => (int) $ordersCompleted,
            'orders_cancelled' => (int) $ordersCancelled,
            'total_customers' => (int) $totalCustomers,
            'new_customers' => (int) $newCustomers,
            'total_products' => (int) $totalProducts,
            'low_stock_products' => (int) $lowStockProducts,
            'out_of_stock_products' => (int) $outOfStock,
            'active_coupons' => (int) $activeCoupons,
            'conversion_rate' => (float) $conversionRate,
            'average_order_value' => (float) ($averageOrderValue ?? 0),
            'customer_lifetime_value' => (float) $customerLifetimeValue,
        ]);
    }

    public function revenueChart(string $period = 'monthly', ?int $months = 12): array
    {
        $format = $period === 'yearly' ? '%Y' : '%Y-%m';
        $since = now()->subMonths($months ?? 12);

        $data = \App\Models\Order::query()->toBase()
            ->select(
                DB::raw("DATE_FORMAT(created_at, '{$format}') as date"),
                DB::raw('SUM(grand_total) as revenue'),
                DB::raw('COUNT(*) as orders'),
            )
            ->where('created_at', '>=', $since)
            ->whereNotIn('status', [OrderStatus::Cancelled->value, OrderStatus::Refunded->value])
            ->groupBy('date')
            ->orderBy('date')
            ->get()
            ->toArray();

        return $data;
    }

    public function salesChart(string $period = 'monthly', ?int $months = 12): array
    {
        $format = $period === 'yearly' ? '%Y' : '%Y-%m';
        $since = now()->subMonths($months ?? 12);

        $data = \App\Models\Order::query()->toBase()
            ->select(
                DB::raw("DATE_FORMAT(created_at, '{$format}') as date"),
                DB::raw('COUNT(*) as total_orders'),
                DB::raw('SUM(grand_total) as total_sales'),
            )
            ->where('created_at', '>=', $since)
            ->whereNotIn('status', [OrderStatus::Cancelled->value, OrderStatus::Refunded->value])
            ->groupBy('date')
            ->orderBy('date')
            ->get()
            ->toArray();

        return $data;
    }

    public function ordersChart(string $period = 'daily', ?int $days = 30): array
    {
        $format = match ($period) {
            'hourly' => '%Y-%m-%d %H:00',
            'daily' => '%Y-%m-%d',
            'weekly' => '%x-W%v',
            default => '%Y-%m-%d',
        };

        $since = now()->subDays($days ?? 30);

        $data = \App\Models\Order::query()->toBase()
            ->select(
                DB::raw("DATE_FORMAT(created_at, '{$format}') as date"),
                DB::raw('COUNT(*) as total'),
                DB::raw("SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending"),
                DB::raw("SUM(CASE WHEN status = 'confirmed' THEN 1 ELSE 0 END) as confirmed"),
                DB::raw("SUM(CASE WHEN status = 'processing' THEN 1 ELSE 0 END) as processing"),
                DB::raw("SUM(CASE WHEN status = 'shipped' THEN 1 ELSE 0 END) as shipped"),
                DB::raw("SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) as delivered"),
                DB::raw("SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled"),
            )
            ->where('created_at', '>=', $since)
            ->groupBy('date')
            ->orderBy('date')
            ->get()
            ->toArray();

        return $data;
    }

    public function topProducts(?int $limit = 10): array
    {
        return DB::table('order_items')
            ->select(
                'order_items.product_id',
                'order_items.product_name',
                DB::raw('SUM(order_items.quantity) as total_sold'),
                DB::raw('SUM(order_items.total) as total_revenue'),
            )
            ->join('orders', 'order_items.order_id', '=', 'orders.id')
            ->whereNotIn('orders.status', [OrderStatus::Cancelled->value, OrderStatus::Refunded->value])
            ->groupBy('order_items.product_id', 'order_items.product_name')
            ->orderByDesc('total_sold')
            ->limit($limit ?? 10)
            ->get()
            ->toArray();
    }

    public function topCategories(?int $limit = 10): array
    {
        return DB::table('order_items')
            ->select(
                'categories.id',
                'categories.name',
                DB::raw('SUM(order_items.total) as revenue'),
                DB::raw('SUM(order_items.quantity) as units_sold'),
            )
            ->join('orders', 'order_items.order_id', '=', 'orders.id')
            ->join('category_product', 'order_items.product_id', '=', 'category_product.product_id')
            ->join('categories', 'category_product.category_id', '=', 'categories.id')
            ->whereNotIn('orders.status', [OrderStatus::Cancelled->value, OrderStatus::Refunded->value])
            ->groupBy('categories.id', 'categories.name')
            ->orderByDesc('revenue')
            ->limit($limit ?? 10)
            ->get()
            ->toArray();
    }

    public function topCustomers(?int $limit = 10): array
    {
        return \App\Models\Order::query()->toBase()
            ->select(
                'orders.customer_id',
                'customers.first_name',
                'customers.last_name',
                'customers.email',
                DB::raw('COUNT(orders.id) as order_count'),
                DB::raw('SUM(orders.grand_total) as total_spent'),
            )
            ->join('customers', 'orders.customer_id', '=', 'customers.id')
            ->whereNotIn('orders.status', [OrderStatus::Cancelled->value, OrderStatus::Refunded->value])
            ->groupBy('orders.customer_id', 'customers.first_name', 'customers.last_name', 'customers.email')
            ->orderByDesc('total_spent')
            ->limit($limit ?? 10)
            ->get()
            ->toArray();
    }

    public function conversionRate(string $from, string $to): float
    {
        $visitors = DB::table('analytics_visits')
            ->whereBetween('created_at', [$from, $to])
            ->count() ?: 1;

        $orders = \App\Models\Order::query()->toBase()
            ->whereBetween('created_at', [$from, $to])
            ->whereNotIn('status', [OrderStatus::Cancelled->value, OrderStatus::Refunded->value])
            ->count();

        return round(($orders / $visitors) * 100, 2);
    }
}
