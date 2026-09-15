<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->bind(
            \App\Contracts\Repositories\ProductRepositoryInterface::class,
            \App\Repositories\ProductRepository::class
        );
        $this->app->bind(
            \App\Contracts\Repositories\CategoryRepositoryInterface::class,
            \App\Repositories\CategoryRepository::class
        );
        $this->app->bind(
            \App\Contracts\Repositories\BlogRepositoryInterface::class,
            \App\Repositories\BlogRepository::class
        );
        $this->app->bind(
            \App\Contracts\Repositories\CouponRepositoryInterface::class,
            \App\Repositories\CouponRepository::class
        );
        $this->app->bind(
            \App\Contracts\Repositories\CustomerRepositoryInterface::class,
            \App\Repositories\CustomerRepository::class
        );
        $this->app->bind(
            \App\Contracts\Repositories\InventoryRepositoryInterface::class,
            \App\Repositories\InventoryRepository::class
        );
        $this->app->bind(
            \App\Contracts\Repositories\MediaRepositoryInterface::class,
            \App\Repositories\MediaRepository::class
        );
        $this->app->bind(
            \App\Contracts\Repositories\NotificationRepositoryInterface::class,
            \App\Repositories\NotificationRepository::class
        );
        $this->app->bind(
            \App\Contracts\Repositories\OrderRepositoryInterface::class,
            \App\Repositories\OrderRepository::class
        );
        $this->app->bind(
            \App\Contracts\Repositories\PageRepositoryInterface::class,
            \App\Repositories\PageRepository::class
        );
        $this->app->bind(
            \App\Contracts\Repositories\ReviewRepositoryInterface::class,
            \App\Repositories\ReviewRepository::class
        );
        $this->app->bind(
            \App\Contracts\Repositories\SettingRepositoryInterface::class,
            \App\Repositories\SettingRepository::class
        );
        $this->app->bind(
            \App\Contracts\Repositories\AuditLogRepositoryInterface::class,
            \App\Repositories\AuditLogRepository::class
        );
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        \Illuminate\Support\Facades\Mail::extend('brevo', function (array $config = []) {
            $key = $config['key'] ?? env('BREVO_API_KEY', env('MAIL_PASSWORD'));
            return new \App\Mail\BrevoTransport($key);
        });
    }
}
