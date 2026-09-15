<?php
declare(strict_types=1);

namespace App\Notifications;

use App\Models\Returns;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ReturnRequested extends Notification
{
    use Queueable;

    public function __construct(
        public Returns $return,
    ) {}

    public function via(object $notifiable): array
    {
        return ['database', 'mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject("Return Requested - #{$this->return->order?->order_number}")
            ->greeting("Hello,")
            ->line("A return request has been submitted.")
            ->line("Customer: {$this->return->customer?->first_name} {$this->return->customer?->last_name}")
            ->line("Order: #{$this->return->order?->order_number}")
            ->line("Reason: {$this->return->reason}")
            ->action('View Return', url("/admin/returns/{$this->return->id}"))
            ->line('Please review and process this return request.');
    }

    public function toDatabase(object $notifiable): array
    {
        return [
            'return_id' => $this->return->id,
            'order_id' => $this->return->order_id,
            'customer_id' => $this->return->customer_id,
            'customer_name' => $this->return->customer?->first_name . ' ' . $this->return->customer?->last_name,
            'order_number' => $this->return->order?->order_number,
            'reason' => $this->return->reason,
            'message' => "Return requested by {$this->return->customer?->first_name} {$this->return->customer?->last_name} for order #{$this->return->order?->order_number}.",
        ];
    }
}
