<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class DashboardResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'total_revenue' => $this->total_revenue ?? null,
            'total_orders' => $this->total_orders ?? null,
            'total_customers' => $this->total_customers ?? null,
            'total_products' => $this->total_products ?? null,
            'average_order_value' => $this->average_order_value ?? null,
            'new_orders_today' => $this->new_orders_today ?? null,
            'pending_orders' => $this->pending_orders ?? null,
            'revenue_today' => $this->revenue_today ?? null,
            'revenue_this_week' => $this->revenue_this_week ?? null,
            'revenue_this_month' => $this->revenue_this_month ?? null,
            'orders_by_status' => $this->orders_by_status ?? null,
            'top_selling_products' => $this->top_selling_products ?? null,
            'recent_orders' => $this->recent_orders ?? null,
            'low_stock_products' => $this->low_stock_products ?? null,
            'growth_percentage' => $this->growth_percentage ?? null,
            'conversion_rate' => $this->conversion_rate ?? null,
        ];
    }
}
