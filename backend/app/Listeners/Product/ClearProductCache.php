<?php
declare(strict_types=1);

namespace App\Listeners\Product;

use App\Events\Product\ProductCreated;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Support\Facades\Cache;

class ClearProductCache implements ShouldQueue
{
    public function handle(ProductCreated $event): void
    {
        Cache::tags(['products'])->flush();

        Cache::forget("product_{$event->product->id}");
        Cache::forget("product_slug_{$event->product->slug}");
        Cache::forget('products_featured');
        Cache::forget('products_count');
    }
}
