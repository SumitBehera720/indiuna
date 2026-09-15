<?php
declare(strict_types=1);

namespace App\Jobs;

use App\Models\ProductVariant;
use App\Models\User;
use App\Notifications\LowStockAlert;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;

class SendLowStockAlert implements ShouldQueue
{
    use Queueable;

    public function __construct(
        private readonly string $variantId,
    ) {}

    public function handle(): void
    {
        $variant = ProductVariant::with(['product', 'inventories.warehouse'])->find($this->variantId);

        if (!$variant) {
            Log::warning("Variant not found for low stock alert: {$this->variantId}");
            return;
        }

        $warehouseStaff = User::role('warehouse_staff')->get();

        foreach ($warehouseStaff as $user) {
            $user->notify(new LowStockAlert($variant));
        }

        Log::info("Low stock alert sent for variant {$variant->sku} ({$variant->name})");
    }
}
