<?php
declare(strict_types=1);

namespace App\Services;

use App\Contracts\Repositories\OrderRepositoryInterface;
use App\Contracts\Repositories\ProductRepositoryInterface;
use App\Contracts\Repositories\CustomerRepositoryInterface;
use App\Contracts\Repositories\CouponRepositoryInterface;
use App\Contracts\Repositories\InventoryRepositoryInterface;
use App\DTOs\Analytics\ReportFilterDTO;
use App\Enums\OrderStatus;
use App\Enums\PaymentStatus;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\DB;

class ReportService
{
    public function __construct(
        private readonly OrderRepositoryInterface $orderRepository,
        private readonly ProductRepositoryInterface $productRepository,
        private readonly CustomerRepositoryInterface $customerRepository,
        private readonly CouponRepositoryInterface $couponRepository,
        private readonly InventoryRepositoryInterface $inventoryRepository,
    ) {}

    public function sales(ReportFilterDTO $filters): array
    {
        $query = \App\Models\Order::query()->toBase()
            ->select(
                DB::raw("DATE_FORMAT(created_at, '{$this->getGroupByFormat($filters->group_by)}') as period"),
                DB::raw('COUNT(*) as total_orders'),
                DB::raw('SUM(grand_total) as total_sales'),
                DB::raw('AVG(grand_total) as average_order_value'),
            )
            ->whereNotIn('status', [OrderStatus::Cancelled->value, OrderStatus::Refunded->value]);

        if ($filters->date_from) {
            $query->where('created_at', '>=', $filters->date_from);
        }

        if ($filters->date_to) {
            $query->where('created_at', '<=', $filters->date_to);
        }

        return $query
            ->groupBy('period')
            ->orderBy('period')
            ->get()
            ->toArray();
    }

    public function revenue(ReportFilterDTO $filters): array
    {
        $query = \App\Models\Order::query()->toBase()
            ->select(
                DB::raw("DATE_FORMAT(created_at, '{$this->getGroupByFormat($filters->group_by)}') as period"),
                DB::raw('SUM(subtotal) as subtotal'),
                DB::raw('SUM(discount_total) as discount'),
                DB::raw('SUM(shipping_total) as shipping'),
                DB::raw('SUM(tax_total) as tax'),
                DB::raw('SUM(grand_total) as total'),
            )
            ->whereNotIn('status', [OrderStatus::Cancelled->value, OrderStatus::Refunded->value]);

        if ($filters->date_from) {
            $query->where('created_at', '>=', $filters->date_from);
        }

        if ($filters->date_to) {
            $query->where('created_at', '<=', $filters->date_to);
        }

        return $query
            ->groupBy('period')
            ->orderBy('period')
            ->get()
            ->toArray();
    }

    public function profit(ReportFilterDTO $filters): array
    {
        $revenueData = $this->revenue($filters);

        return array_map(function ($row) {
            $cost = DB::table('order_items')
                ->join('product_variants', 'order_items.variant_id', '=', 'product_variants.id')
                ->whereBetween('order_items.created_at', [$row->period, $row->period])
                ->sum(DB::raw('order_items.quantity * product_variants.cost_price'));

            $row->cost = (float) $cost;
            $row->profit = (float) ($row->total - $cost);
            $row->margin_percentage = $row->total > 0
                ? round(($row->profit / $row->total) * 100, 2)
                : 0;

            return $row;
        }, $revenueData);
    }

    public function inventory(ReportFilterDTO $filters): array
    {
        $alerts = $this->inventoryRepository->getAlerts();

        $totalStock = DB::table('inventory')
            ->join('product_variants', 'inventory.variant_id', '=', 'product_variants.id')
            ->sum('inventory.quantity');

        $totalValue = DB::table('inventory')
            ->join('product_variants', 'inventory.variant_id', '=', 'product_variants.id')
            ->select(DB::raw('SUM(inventory.quantity * product_variants.cost_price) as total_value'))
            ->first();

        return [
            'total_stock' => (int) $totalStock,
            'total_value' => (float) ($totalValue->total_value ?? 0),
            'low_stock_count' => $alerts->count(),
            'alerts' => $alerts,
        ];
    }

    public function customers(ReportFilterDTO $filters): array
    {
        $query = DB::table('customers')
            ->select(
                DB::raw("DATE_FORMAT(created_at, '{$this->getGroupByFormat($filters->group_by)}') as period"),
                DB::raw('COUNT(*) as new_customers'),
            );

        if ($filters->date_from) {
            $query->where('created_at', '>=', $filters->date_from);
        }

        if ($filters->date_to) {
            $query->where('created_at', '<=', $filters->date_to);
        }

        return [
            'total_customers' => $this->customerRepository->count(),
            'new_customers_by_period' => $query->groupBy('period')->orderBy('period')->get()->toArray(),
        ];
    }

    public function products(ReportFilterDTO $filters): array
    {
        $topSellers = DB::table('order_items')
            ->select(
                'order_items.product_id',
                'order_items.product_name',
                DB::raw('SUM(order_items.quantity) as total_sold'),
                DB::raw('SUM(order_items.total) as total_revenue'),
            )
            ->join('orders', 'order_items.order_id', '=', 'orders.id')
            ->whereNotIn('orders.status', [OrderStatus::Cancelled->value, OrderStatus::Refunded->value]);

        if ($filters->date_from) {
            $topSellers->where('orders.created_at', '>=', $filters->date_from);
        }

        if ($filters->date_to) {
            $topSellers->where('orders.created_at', '<=', $filters->date_to);
        }

        return [
            'top_sellers' => $topSellers
                ->groupBy('order_items.product_id', 'order_items.product_name')
                ->orderByDesc('total_sold')
                ->limit(20)
                ->get()
                ->toArray(),
        ];
    }

    public function taxes(ReportFilterDTO $filters): array
    {
        $query = \App\Models\Order::query()->toBase()
            ->select(
                DB::raw("DATE_FORMAT(created_at, '{$this->getGroupByFormat($filters->group_by)}') as period"),
                DB::raw('SUM(tax_total) as tax_collected'),
                DB::raw('COUNT(*) as order_count'),
            )
            ->where('tax_total', '>', 0);

        if ($filters->date_from) {
            $query->where('created_at', '>=', $filters->date_from);
        }

        if ($filters->date_to) {
            $query->where('created_at', '<=', $filters->date_to);
        }

        return $query
            ->groupBy('period')
            ->orderBy('period')
            ->get()
            ->toArray();
    }

    public function coupons(ReportFilterDTO $filters): array
    {
        $usage = DB::table('order_coupons')
            ->select(
                'coupon_id',
                DB::raw('COUNT(*) as usage_count'),
                DB::raw('SUM(discount_amount) as total_discount'),
            );

        if ($filters->date_from) {
            $usage->where('created_at', '>=', $filters->date_from);
        }

        if ($filters->date_to) {
            $usage->where('created_at', '<=', $filters->date_to);
        }

        return $usage
            ->groupBy('coupon_id')
            ->orderByDesc('usage_count')
            ->get()
            ->toArray();
    }

    public function returns(ReportFilterDTO $filters): array
    {
        $query = DB::table('order_items')
            ->select(
                DB::raw("DATE_FORMAT(updated_at, '{$this->getGroupByFormat($filters->group_by)}') as period"),
                DB::raw('COUNT(*) as return_count'),
                DB::raw('SUM(total) as return_value'),
            )
            ->where('is_returned', true);

        if ($filters->date_from) {
            $query->where('updated_at', '>=', $filters->date_from);
        }

        if ($filters->date_to) {
            $query->where('updated_at', '<=', $filters->date_to);
        }

        return $query
            ->groupBy('period')
            ->orderBy('period')
            ->get()
            ->toArray();
    }

    public function shipping(ReportFilterDTO $filters): array
    {
        $query = \App\Models\Order::query()->toBase()
            ->select(
                DB::raw("DATE_FORMAT(created_at, '{$this->getGroupByFormat($filters->group_by)}') as period"),
                DB::raw('COUNT(*) as order_count'),
                DB::raw('SUM(shipping_total) as shipping_revenue'),
                DB::raw('AVG(shipping_total) as average_shipping'),
            )
            ->where('shipping_total', '>', 0);

        if ($filters->date_from) {
            $query->where('created_at', '>=', $filters->date_from);
        }

        if ($filters->date_to) {
            $query->where('created_at', '<=', $filters->date_to);
        }

        return $query
            ->groupBy('period')
            ->orderBy('period')
            ->get()
            ->toArray();
    }

    public function export(string $type, ReportFilterDTO $filters): string
    {
        $data = match ($type) {
            'sales' => $this->sales($filters),
            'revenue' => $this->revenue($filters),
            'profit' => $this->profit($filters),
            'inventory' => $this->inventory($filters),
            'customers' => $this->customers($filters),
            'products' => $this->products($filters),
            'taxes' => $this->taxes($filters),
            'coupons' => $this->coupons($filters),
            'returns' => $this->returns($filters),
            'shipping' => $this->shipping($filters),
            default => throw new \InvalidArgumentException("Unknown report type: {$type}"),
        };

        $csv = fopen('php://temp', 'r+');

        if (!empty($data) && is_array($data)) {
            fputcsv($csv, array_keys((array) $data[0]));
            foreach ($data as $row) {
                fputcsv($csv, (array) $row);
            }
        }

        rewind($csv);
        $content = stream_get_contents($csv);
        fclose($csv);

        return $content;
    }

    private function getGroupByFormat(?string $groupBy): string
    {
        return match ($groupBy) {
            'year' => '%Y',
            'month' => '%Y-%m',
            'week' => '%x-W%v',
            'day' => '%Y-%m-%d',
            default => '%Y-%m-%d',
        };
    }
}
