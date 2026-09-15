<?php

namespace Database\Seeders;

use App\Models\ShippingMethod;
use Illuminate\Database\Seeder;

class ShippingMethodSeeder extends Seeder
{
    public function run(): void
    {
        $methods = [
            [
                'code' => 'standard',
                'name' => 'Standard Shipping',
                'description' => 'Delivery in 3-5 business days',
                'carrier' => 'India Post',
                'is_active' => true,
                'is_free' => false,
                'sort_order' => 1,
                'configuration' => json_encode(['base_rate' => 49, 'estimated_days_min' => 3, 'estimated_days_max' => 5]),
            ],
            [
                'code' => 'express',
                'name' => 'Express Shipping',
                'description' => 'Delivery in 1-2 business days',
                'carrier' => 'Delhivery',
                'is_active' => true,
                'is_free' => false,
                'sort_order' => 2,
                'configuration' => json_encode(['base_rate' => 99, 'estimated_days_min' => 1, 'estimated_days_max' => 2]),
            ],
            [
                'code' => 'free',
                'name' => 'Free Shipping',
                'description' => 'Free delivery in 5-7 business days on orders above ₹499',
                'carrier' => 'India Post',
                'is_active' => true,
                'is_free' => true,
                'sort_order' => 3,
                'min_order_amount' => 499.00,
                'configuration' => json_encode(['base_rate' => 0, 'estimated_days_min' => 5, 'estimated_days_max' => 7, 'condition' => 'order > ₹499']),
            ],
        ];

        foreach ($methods as $method) {
            ShippingMethod::firstOrCreate(
                ['code' => $method['code']],
                $method,
            );
        }
    }
}
