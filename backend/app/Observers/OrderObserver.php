<?php
declare(strict_types=1);

namespace App\Observers;

use App\Models\Order;
use App\Models\OrderStatusHistory;
use Illuminate\Support\Facades\Auth;

class OrderObserver
{
    public function creating(Order $order): void
    {
        $order->order_number = 'ORD-' . now()->format('Ymd') . '-' . strtoupper(substr(uniqid(), -5));
    }

    public function created(Order $order): void
    {
        OrderStatusHistory::create([
            'order_id' => $order->id,
            'status' => $order->status->value,
            'previous_status' => null,
            'changed_by' => Auth::id(),
        ]);
    }
}
