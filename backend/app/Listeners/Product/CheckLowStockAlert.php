<?php
declare(strict_types=1);

namespace App\Listeners\Product;

use App\Events\Product\ProductStockLow;
use App\Jobs\SendLowStockAlert;
use Illuminate\Contracts\Queue\ShouldQueue;

class CheckLowStockAlert implements ShouldQueue
{
    public function handle(ProductStockLow $event): void
    {
        if (!$event->variant) {
            return;
        }

        SendLowStockAlert::dispatch($event->variant->id);
    }
}
