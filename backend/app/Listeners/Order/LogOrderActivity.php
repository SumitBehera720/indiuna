<?php
declare(strict_types=1);

namespace App\Listeners\Order;

use App\Events\Order\OrderCreated;
use App\Events\Order\OrderStatusChanged;
use Illuminate\Contracts\Queue\ShouldQueue;

class LogOrderActivity implements ShouldQueue
{
    public function handle(OrderCreated|OrderStatusChanged $event): void
    {
        if ($event instanceof OrderCreated) {
            activity()
                ->performedOn($event->order)
                ->withProperties([
                    'order_number' => $event->order->order_number,
                    'total' => $event->order->grand_total,
                ])
                ->log('Order created');
        }

        if ($event instanceof OrderStatusChanged) {
            activity()
                ->performedOn($event->order)
                ->withProperties([
                    'old_status' => $event->oldStatus->value,
                    'new_status' => $event->newStatus->value,
                ])
                ->log("Order status changed from {$event->oldStatus->value} to {$event->newStatus->value}");
        }
    }
}
