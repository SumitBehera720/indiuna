<?php

namespace App\Providers;

use App\Events\Order\OrderCreated;
use App\Events\Order\OrderStatusChanged;
use App\Events\Product\ProductCreated;
use App\Events\Product\ProductUpdated;
use App\Events\Customer\CustomerRegistered;
use App\Listeners\Order\SendOrderConfirmationNotification;
use App\Listeners\Order\UpdateInventoryOnOrderPlaced;
use App\Listeners\Order\LogOrderActivity;
use App\Listeners\Product\ClearProductCache;
use App\Listeners\Customer\SendWelcomeNotification;
use Illuminate\Foundation\Support\Providers\EventServiceProvider as ServiceProvider;

class EventServiceProvider extends ServiceProvider
{
    protected $listen = [
        OrderCreated::class => [
            SendOrderConfirmationNotification::class,
            UpdateInventoryOnOrderPlaced::class,
            LogOrderActivity::class,
        ],
        OrderStatusChanged::class => [
            LogOrderActivity::class,
        ],
        ProductCreated::class => [
            ClearProductCache::class,
        ],
        ProductUpdated::class => [
            ClearProductCache::class,
        ],
        CustomerRegistered::class => [
            SendWelcomeNotification::class,
        ],
    ];

    public function boot(): void
    {
        parent::boot();
    }
}
