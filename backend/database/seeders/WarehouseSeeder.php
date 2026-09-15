<?php

namespace Database\Seeders;

use App\Models\Warehouse;
use Illuminate\Database\Seeder;

class WarehouseSeeder extends Seeder
{
    public function run(): void
    {
        Warehouse::firstOrCreate(
            ['code' => 'MAIN'],
            [
                'name' => 'Primary Warehouse',
                'description' => 'Default warehouse for storefront orders',
                'address_line1' => '123, Business Park',
                'city' => 'Mumbai',
                'state' => 'Maharashtra',
                'postal_code' => '400001',
                'country' => 'India',
                'phone' => '+91-9876543210',
                'email' => 'warehouse@indiuna.com',
                'contact_person' => 'Indiuna Ops',
                'is_active' => true,
                'is_primary' => true,
            ],
        );
    }
}
