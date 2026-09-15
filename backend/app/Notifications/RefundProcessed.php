<?php
declare(strict_types=1);

namespace App\Notifications;

use App\Models\Refund;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class RefundProcessed extends Notification
{
    use Queueable;

    public function __construct(
        public Refund $refund,
    ) {}

    public function via(object $notifiable): array
    {
        return ['mail', 'database'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject("Refund Processed - #{$this->refund->order?->order_number}")
            ->greeting("Hello {$notifiable->name},")
            ->line("Your refund of ₹" . number_format((float) $this->refund->amount, 2) . " has been processed.")
            ->line("Order: #{$this->refund->order?->order_number}")
            ->action('View Order', url("/orders/{$this->refund->order_id}"))
            ->line('If you have any questions, please contact our support team.');
    }

    public function toDatabase(object $notifiable): array
    {
        return [
            'order_id' => $this->refund->order_id,
            'refund_id' => $this->refund->id,
            'return_id' => $this->refund->return_id,
            'amount' => $this->refund->amount,
            'message' => "Refund of ₹{$this->refund->amount} processed for order #{$this->refund->order?->order_number}.",
        ];
    }
}
