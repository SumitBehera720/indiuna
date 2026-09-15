<?php

declare(strict_types=1);

namespace App\Mail\Customer;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class WelcomeEmail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public User $user,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Welcome to Indiuna! 🎉',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.customer.welcome',
            with: [
                'user' => $this->user,
                'name' => $this->user->first_name ?? 'Customer',
            ],
        );
    }
}
