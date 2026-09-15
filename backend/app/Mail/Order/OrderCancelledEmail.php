<?php

declare(strict_types=1);

namespace App\Mail\Order;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class OrderCancelledEmail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public Order $order,
        public ?string $reason = null,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "Order #{$this->order->order_number} Cancelled",
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.orders.cancelled',
            with: [
                'order' => $this->order->load(['items']),
                'reason' => $this->reason ?? 'Cancelled by customer / store update',
            ],
        );
    }
}
