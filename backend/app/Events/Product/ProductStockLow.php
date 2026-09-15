<?php
declare(strict_types=1);

namespace App\Events\Product;

use App\Models\Inventory;
use App\Models\ProductVariant;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ProductStockLow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public ?ProductVariant $variant,
        public Inventory $inventory,
    ) {}
}
