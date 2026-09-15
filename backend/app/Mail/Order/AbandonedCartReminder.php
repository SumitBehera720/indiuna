<?php
declare(strict_types=1);

namespace App\Mail\Order;

use App\Models\Cart;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class AbandonedCartReminder extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public Cart $cart,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'You left something in your cart!',
        );
    }

    public function content(): Content
    {
        return new Content(
            markdown: 'emails.orders.abandoned-cart',
            with: [
                'cart' => $this->cart,
                'items' => $this->cart->items,
                'customer' => $this->cart->customer,
            ],
        );
    }
}
