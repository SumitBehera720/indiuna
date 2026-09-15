<?php

declare(strict_types=1);

namespace App\Mail;

use App\Models\Product;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ProductBackInStockEmail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public Product $product,
        public ?string $variantName = null,
        public ?string $recipientName = null,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "🎉 Great News: {$this->product->name} is Back in Stock!",
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.customer.back_in_stock',
            with: [
                'productName' => $this->product->name,
                'variantName' => $this->variantName,
                'name' => $this->recipientName ?? 'Customer',
            ],
        );
    }
}
