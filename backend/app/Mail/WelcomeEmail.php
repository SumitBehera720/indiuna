<?php
declare(strict_types=1);

namespace App\Mail;

use App\Models\Customer;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class WelcomeEmail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public Customer $customer,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Welcome to Indiuna!',
        );
    }

    public function content(): Content
    {
        return new Content(
            markdown: 'emails.customer.welcome',
            with: [
                'customer' => $this->customer,
                'name' => $this->customer->first_name,
            ],
        );
    }
}
