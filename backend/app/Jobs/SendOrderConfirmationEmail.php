<?php
declare(strict_types=1);

namespace App\Jobs;

use App\Mail\Order\OrderConfirmation;
use App\Models\Order;
use App\Repositories\OrderRepository;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class SendOrderConfirmationEmail implements ShouldQueue
{
    use Queueable;

    public function __construct(
        private readonly string $orderId,
    ) {}

    public function handle(OrderRepository $orderRepository): void
    {
        $order = $orderRepository->findOrFail($this->orderId);
        $order->load(['customer', 'items', 'statusHistory', 'payments', 'shipments']);

        $email = $order->customer?->email;

        if (!$email) {
            Log::warning("No customer email for order: {$this->orderId}");
            return;
        }

        Mail::to($email)->send(new OrderConfirmation($order));

        Log::info("Order confirmation email sent to {$email} for order {$order->order_number}");
    }
}
