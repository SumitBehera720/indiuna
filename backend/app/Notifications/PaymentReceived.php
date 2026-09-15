<?php
declare(strict_types=1);

namespace App\Notifications;

use App\Models\Payment;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class PaymentReceived extends Notification
{
    use Queueable;

    public function __construct(
        public Payment $payment,
    ) {}

    public function via(object $notifiable): array
    {
        return ['mail', 'database'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject("Payment Received - #{$this->payment->order?->order_number}")
            ->greeting("Hello {$notifiable->name},")
            ->line("We have received your payment of ₹" . number_format((float) $this->payment->amount, 2) . ".")
            ->line("Order: #{$this->payment->order?->order_number}")
            ->action('View Order', url("/orders/{$this->payment->order_id}"))
            ->line('Thank you for your payment!');
    }

    public function toDatabase(object $notifiable): array
    {
        return [
            'order_id' => $this->payment->order_id,
            'payment_id' => $this->payment->id,
            'amount' => $this->payment->amount,
            'payment_method' => $this->payment->payment_method,
            'message' => "Payment of ₹{$this->payment->amount} received for order #{$this->payment->order?->order_number}.",
        ];
    }
}
