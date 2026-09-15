<?php

declare(strict_types=1);

namespace App\Mail\Order;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class OrderShippedEmail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public Order $order,
        public ?string $trackingCode = null,
        public ?string $trackingUrl = null,
        public ?string $carrierName = null,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "Your Order #{$this->order->order_number} Has Been Shipped! 🚚",
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.orders.shipped',
            with: [
                'order' => $this->order->load(['items']),
                'trackingCode' => $this->trackingCode ?? $this->order->tracking_number ?? $this->order->awb_code ?? '',
                'trackingUrl' => $this->trackingUrl ?? $this->order->tracking_url ?? '',
                'carrierName' => $this->carrierName ?? $this->order->shipping_carrier ?? 'Shiprocket',
            ],
        );
    }
}
