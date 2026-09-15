<?php

declare(strict_types=1);

namespace App\Mail\Inventory;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class OutOfStockAlertEmail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public string $productName,
        public string $variantName,
        public string $sku,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "⚠️ OUT OF STOCK ALERT: {$this->productName} ({$this->sku})",
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.inventory.out_of_stock',
            with: [
                'productName' => $this->productName,
                'variantName' => $this->variantName,
                'sku' => $this->sku,
            ],
        );
    }
}
