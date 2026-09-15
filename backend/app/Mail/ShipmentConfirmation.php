<?php
declare(strict_types=1);

namespace App\Mail;

use App\Models\Shipment;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ShipmentConfirmation extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public Shipment $shipment,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "Your Order Has Shipped - #{$this->shipment->order?->order_number}",
        );
    }

    public function content(): Content
    {
        return new Content(
            markdown: 'emails.orders.shipment',
            with: [
                'shipment' => $this->shipment,
                'order' => $this->shipment->order,
                'tracking_number' => $this->shipment->tracking_number,
                'carrier' => $this->shipment->carrier,
            ],
        );
    }
}
