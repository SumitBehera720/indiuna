<?php
declare(strict_types=1);

namespace App\Mail;

use App\Models\Inventory;
use App\Models\ProductVariant;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class LowStockAlert extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public ProductVariant $variant,
        public Inventory $inventory,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "Low Stock Alert - {$this->variant->sku}",
        );
    }

    public function content(): Content
    {
        return new Content(
            markdown: 'emails.inventory.low-stock',
            with: [
                'variant' => $this->variant,
                'inventory' => $this->inventory,
                'product' => $this->variant->product,
                'warehouse' => $this->inventory->warehouse,
                'available_quantity' => $this->inventory->available_quantity,
            ],
        );
    }
}
