<?php

declare(strict_types=1);

namespace App\Mail\Auth;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ResetPasswordEmail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public string $email,
        public string $token,
        public ?string $name = null,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Reset Your Password - Indiuna',
        );
    }

    public function content(): Content
    {
        $appUrl = rtrim(config('app.url', 'https://indiuna.com'), '/');
        $resetUrl = "{$appUrl}/?reset_token={$this->token}&email=" . urlencode($this->email);

        return new Content(
            view: 'emails.auth.reset_password',
            with: [
                'email' => $this->email,
                'token' => $this->token,
                'name' => $this->name ?? 'Customer',
                'resetUrl' => $resetUrl,
            ],
        );
    }
}
