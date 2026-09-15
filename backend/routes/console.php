<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Cleanup expired guest carts daily
Schedule::command('indiuna:cleanup-carts')->daily();

// Low stock alerts every hour
Schedule::command('indiuna:check-low-stock')->hourly();

// Sync in-transit shipments with Shiprocket tracking (if enabled)
Schedule::command('indiuna:sync-shipment-tracking')->everyThirtyMinutes();

// Settle Razorpay payments paid at the gateway but not confirmed via webhook/storefront
Schedule::command('indiuna:settle-pending-payments')->everyFiveMinutes();

// Process queued jobs on shared hosting (no daemon workers available)
Schedule::command('queue:work database --stop-when-empty --max-time=60')
    ->everyMinute()
    ->withoutOverlapping();
