<?php
declare(strict_types=1);

namespace App\Notifications;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class OrderConfirmed extends Notification
{
    use Queueable;

    public function __construct(
        public Order $order,
    ) {}

    public function via(object $notifiable): array
    {
        return ['mail', 'database'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject("Order Confirmed - #{$this->order->order_number}")
            ->greeting("Hello {$notifiable->name},")
            ->line("Your order #{$this->order->order_number} has been confirmed.")
            ->line("Total: ₹" . number_format((float) $this->order->grand_total, 2))
            ->action('View Order', url("/orders/{$this->order->id}"))
            ->line('Thank you for your purchase!');
    }

    public function toDatabase(object $notifiable): array
    {
        return [
            'order_id' => $this->order->id,
            'order_number' => $this->order->order_number,
            'status' => $this->order->status->value,
            'message' => "Order #{$this->order->order_number} has been confirmed.",
        ];
    }
}
