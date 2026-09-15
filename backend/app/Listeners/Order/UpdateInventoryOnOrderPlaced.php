<?php
declare(strict_types=1);

namespace App\Listeners\Order;

use App\Enums\StockMovementType;
use App\Events\Order\OrderCreated;
use App\Models\StockMovement;
use Illuminate\Contracts\Queue\ShouldQueue;

class UpdateInventoryOnOrderPlaced implements ShouldQueue
{
    public function handle(OrderCreated $event): void
    {
        $order = $event->order;

        foreach ($order->items as $item) {
            if (!$item->variant || !$item->variant->is_tracked) {
                continue;
            }

            $item->variant->decrement('stock', $item->quantity);

            $inventory = $item->variant->inventories()->first();
            if ($inventory) {
                $inventory->decrement('quantity', $item->quantity);

                StockMovement::create([
                    'variant_id' => $item->variant_id,
                    'warehouse_id' => $inventory->warehouse_id,
                    'type' => StockMovementType::Sale,
                    'quantity' => $item->quantity,
                    'before_quantity' => $inventory->quantity + $item->quantity,
                    'after_quantity' => $inventory->quantity,
                    'reference_type' => get_class($order),
                    'reference_id' => $order->id,
                    'reason' => 'Order placed',
                ]);
            }
        }
    }
}
