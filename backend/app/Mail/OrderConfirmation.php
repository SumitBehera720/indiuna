<?php
declare(strict_types=1);

namespace App\Mail;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class OrderConfirmation extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public Order $order,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "Order Confirmed - #{$this->order->order_number}",
        );
    }

    public function content(): Content
    {
        return new Content(
            markdown: 'emails.orders.confirmation',
            with: [
                'order' => $this->order,
                'customer' => $this->order->customer,
                'items' => $this->order->items,
                'subtotal' => $this->order->subtotal,
                'discount_total' => $this->order->discount_total,
                'shipping_total' => $this->order->shipping_total,
                'tax_total' => $this->order->tax_total,
                'grand_total' => $this->order->grand_total,
            ],
        );
    }
}
