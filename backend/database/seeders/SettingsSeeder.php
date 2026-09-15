<?php

namespace Database\Seeders;

use App\Models\Setting;
use Illuminate\Database\Seeder;

class SettingsSeeder extends Seeder
{
    public function run(): void
    {
        $settings = [
            // Store
            ['group' => 'store', 'key' => 'store_name', 'value' => 'Indiuna', 'type' => 'string', 'is_public' => true],
            ['group' => 'store', 'key' => 'store_email', 'value' => 'support@indiuna.com', 'type' => 'string', 'is_public' => true],
            ['group' => 'store', 'key' => 'store_phone', 'value' => '+91-9876543210', 'type' => 'string', 'is_public' => true],
            ['group' => 'store', 'key' => 'store_address', 'value' => '123, Business Park, Mumbai, Maharashtra', 'type' => 'string', 'is_public' => true],

            // General
            ['group' => 'general', 'key' => 'currency', 'value' => 'INR', 'type' => 'string', 'is_public' => true],
            ['group' => 'general', 'key' => 'timezone', 'value' => 'Asia/Kolkata', 'type' => 'string', 'is_public' => false],
            ['group' => 'general', 'key' => 'locale', 'value' => 'en', 'type' => 'string', 'is_public' => false],

            // Shipping
            ['group' => 'shipping', 'key' => 'default_method', 'value' => 'standard', 'type' => 'string', 'is_public' => false],
            ['group' => 'shipping', 'key' => 'free_shipping_threshold', 'value' => '499', 'type' => 'decimal', 'is_public' => true],

            // Shiprocket
            ['group' => 'shipping', 'key' => 'shiprocket_enabled', 'value' => (config('services.shiprocket.email') && config('services.shiprocket.password')) ? 'true' : 'false', 'type' => 'boolean', 'is_public' => false],
            ['group' => 'shipping', 'key' => 'shiprocket_email', 'value' => config('services.shiprocket.email'), 'type' => 'string', 'is_public' => false],
            ['group' => 'shipping', 'key' => 'shiprocket_password', 'value' => config('services.shiprocket.password'), 'type' => 'string', 'is_public' => false],
            ['group' => 'shipping', 'key' => 'shiprocket_webhook_token', 'value' => '', 'type' => 'string', 'is_public' => false],
            ['group' => 'shipping', 'key' => 'pickup_postcode', 'value' => '400001', 'type' => 'string', 'is_public' => false],
            ['group' => 'shipping', 'key' => 'shiprocket_pickup_location', 'value' => 'Primary', 'type' => 'string', 'is_public' => false],
            ['group' => 'shipping', 'key' => 'shiprocket_channel_id', 'value' => '', 'type' => 'string', 'is_public' => false],
            ['group' => 'shipping', 'key' => 'shiprocket_company_name', 'value' => 'Indiuna', 'type' => 'string', 'is_public' => false],

            // Tax
            ['group' => 'tax', 'key' => 'default_tax_rate', 'value' => '18', 'type' => 'decimal', 'is_public' => true],

            // SEO
            ['group' => 'seo', 'key' => 'site_title', 'value' => 'Indiuna - Premium Indian Products', 'type' => 'string', 'is_public' => true],
            ['group' => 'seo', 'key' => 'meta_description', 'value' => 'Discover premium Indian products at Indiuna. Shop traditional and modern items with fast shipping across India.', 'type' => 'text', 'is_public' => true],

            // Social
            ['group' => 'social', 'key' => 'instagram', 'value' => 'https://instagram.com/indiuna', 'type' => 'string', 'is_public' => true],
            ['group' => 'social', 'key' => 'facebook', 'value' => 'https://facebook.com/indiuna', 'type' => 'string', 'is_public' => true],
            ['group' => 'social', 'key' => 'youtube', 'value' => 'https://youtube.com/@indiuna', 'type' => 'string', 'is_public' => true],
            ['group' => 'social', 'key' => 'twitter', 'value' => 'https://twitter.com/indiuna', 'type' => 'string', 'is_public' => true],

            // Payment
            ['group' => 'payment', 'key' => 'cod_enabled', 'value' => 'true', 'type' => 'boolean', 'is_public' => true],
            ['group' => 'payment', 'key' => 'razorpay_enabled', 'value' => 'true', 'type' => 'boolean', 'is_public' => false],
            ['group' => 'payment', 'key' => 'razorpay_key_id', 'value' => config('services.razorpay.key_id'), 'type' => 'string', 'is_public' => false],
            ['group' => 'payment', 'key' => 'razorpay_key_secret', 'value' => config('services.razorpay.key_secret'), 'type' => 'string', 'is_public' => false],
        ];

        foreach ($settings as $setting) {
            $overwriteKeys = ['razorpay_key_id', 'razorpay_key_secret', 'shiprocket_email', 'shiprocket_password', 'shiprocket_enabled'];
            if (in_array($setting['key'], $overwriteKeys, true)) {
                Setting::updateOrCreate(
                    ['group' => $setting['group'], 'key' => $setting['key']],
                    $setting
                );
            } else {
                Setting::firstOrCreate(
                    ['group' => $setting['group'], 'key' => $setting['key']],
                    $setting
                );
            }
        }
    }
}
