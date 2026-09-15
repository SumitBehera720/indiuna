<?php
declare(strict_types=1);

namespace App\Observers;

use App\Events\Product\ProductStockLow;
use App\Models\Inventory;

class InventoryObserver
{
    public function updated(Inventory $inventory): void
    {
        if ($inventory->wasChanged('quantity') || $inventory->wasChanged('reserved_quantity')) {
            if ($inventory->available_quantity <= ($inventory->low_stock_threshold ?? 0)) {
                ProductStockLow::dispatch($inventory->variant, $inventory);
            }
        }
    }
}
