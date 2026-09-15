<?php
declare(strict_types=1);

namespace App\Listeners\Order;

use App\Events\Order\OrderCreated;
use App\Jobs\SendOrderConfirmationEmail;
use Illuminate\Contracts\Queue\ShouldQueue;

class SendOrderConfirmationNotification implements ShouldQueue
{
    public function handle(OrderCreated $event): void
    {
        SendOrderConfirmationEmail::dispatch($event->order->id);
    }
}
