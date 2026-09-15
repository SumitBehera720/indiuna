<?php

namespace App\Console\Commands;

use App\Jobs\SendLowStockAlert;
use App\Models\Inventory;
use Illuminate\Console\Command;

class CheckLowStock extends Command
{
    protected $signature = 'indiuna:check-low-stock';

    protected $description = 'Check inventory for low stock items and send alerts';

    public function handle(): int
    {
        $lowStockItems = Inventory::whereColumn('available_quantity', '<=', 'low_stock_threshold')->get();

        foreach ($lowStockItems as $item) {
            SendLowStockAlert::dispatch($item);
        }

        $this->info("Dispatched {$lowStockItems->count()} low stock alerts.");

        return Command::SUCCESS;
    }
}
