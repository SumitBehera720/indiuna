<?php
declare(strict_types=1);

namespace App\Notifications;

use App\Models\Shipment;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class OrderShipped extends Notification
{
    use Queueable;

    public function __construct(
        public Shipment $shipment,
    ) {}

    public function via(object $notifiable): array
    {
        return ['mail', 'database'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject("Your Order Has Shipped - #{$this->shipment->order?->order_number}")
            ->greeting("Hello {$notifiable->name},")
            ->line("Your order #{$this->shipment->order?->order_number} has been shipped.")
            ->line("Carrier: {$this->shipment->carrier}")
            ->line("Tracking Number: {$this->shipment->tracking_number}")
            ->action('Track Order', url("/orders/{$this->shipment->order_id}"))
            ->line('Thank you for shopping with us!');
    }

    public function toDatabase(object $notifiable): array
    {
        return [
            'order_id' => $this->shipment->order_id,
            'order_number' => $this->shipment->order?->order_number,
            'shipment_id' => $this->shipment->id,
            'tracking_number' => $this->shipment->tracking_number,
            'carrier' => $this->shipment->carrier,
            'message' => "Order #{$this->shipment->order?->order_number} has been shipped.",
        ];
    }
}
