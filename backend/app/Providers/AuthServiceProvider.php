<?php
declare(strict_types=1);

namespace App\Providers;

use App\Models\Customer;
use App\Models\Media;
use App\Models\Order;
use App\Models\Product;
use App\Policies\CustomerPolicy;
use App\Policies\MediaPolicy;
use App\Policies\OrderPolicy;
use App\Policies\ProductPolicy;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;

class AuthServiceProvider extends ServiceProvider
{
    protected $policies = [
        Product::class => ProductPolicy::class,
        Order::class => OrderPolicy::class,
        Customer::class => CustomerPolicy::class,
        Media::class => MediaPolicy::class,
    ];

    public function boot(): void
    {
        $this->registerPolicies();
    }
}
