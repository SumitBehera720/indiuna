<?php
declare(strict_types=1);

namespace App\DTOs\Analytics;

class DashboardMetricsDTO
{
    public function __construct(
        public readonly ?float $total_revenue = null,
        public readonly ?float $revenue_today = null,
        public readonly ?float $revenue_yesterday = null,
        public readonly ?float $revenue_this_month = null,
        public readonly ?float $revenue_this_year = null,
        public readonly ?int $orders_today = null,
        public readonly ?int $orders_pending = null,
        public readonly ?int $orders_completed = null,
        public readonly ?int $orders_cancelled = null,
        public readonly ?int $total_customers = null,
        public readonly ?int $new_customers = null,
        public readonly ?int $total_products = null,
        public readonly ?int $low_stock_products = null,
        public readonly ?int $out_of_stock_products = null,
        public readonly ?int $active_coupons = null,
        public readonly ?float $conversion_rate = null,
        public readonly ?float $average_order_value = null,
        public readonly ?float $customer_lifetime_value = null,
    ) {}

    public function toArray(): array
    {
        return get_object_vars($this);
    }

    public static function fromArray(array $data): self
    {
        return new self(
            total_revenue: isset($data['total_revenue']) ? (float)$data['total_revenue'] : null,
            revenue_today: isset($data['revenue_today']) ? (float)$data['revenue_today'] : null,
            revenue_yesterday: isset($data['revenue_yesterday']) ? (float)$data['revenue_yesterday'] : null,
            revenue_this_month: isset($data['revenue_this_month']) ? (float)$data['revenue_this_month'] : null,
            revenue_this_year: isset($data['revenue_this_year']) ? (float)$data['revenue_this_year'] : null,
            orders_today: isset($data['orders_today']) ? (int)$data['orders_today'] : null,
            orders_pending: isset($data['orders_pending']) ? (int)$data['orders_pending'] : null,
            orders_completed: isset($data['orders_completed']) ? (int)$data['orders_completed'] : null,
            orders_cancelled: isset($data['orders_cancelled']) ? (int)$data['orders_cancelled'] : null,
            total_customers: isset($data['total_customers']) ? (int)$data['total_customers'] : null,
            new_customers: isset($data['new_customers']) ? (int)$data['new_customers'] : null,
            total_products: isset($data['total_products']) ? (int)$data['total_products'] : null,
            low_stock_products: isset($data['low_stock_products']) ? (int)$data['low_stock_products'] : null,
            out_of_stock_products: isset($data['out_of_stock_products']) ? (int)$data['out_of_stock_products'] : null,
            active_coupons: isset($data['active_coupons']) ? (int)$data['active_coupons'] : null,
            conversion_rate: isset($data['conversion_rate']) ? (float)$data['conversion_rate'] : null,
            average_order_value: isset($data['average_order_value']) ? (float)$data['average_order_value'] : null,
            customer_lifetime_value: isset($data['customer_lifetime_value']) ? (float)$data['customer_lifetime_value'] : null,
        );
    }
}
