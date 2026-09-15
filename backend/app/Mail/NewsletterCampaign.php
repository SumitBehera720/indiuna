<?php
declare(strict_types=1);

namespace App\Mail;

use App\Models\NewsletterSubscriber;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class NewsletterCampaign extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public string $campaignId,
        public NewsletterSubscriber $subscriber,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Newsletter Update',
        );
    }

    public function content(): Content
    {
        return new Content(
            markdown: 'emails.newsletter.campaign',
            with: [
                'campaignId' => $this->campaignId,
                'subscriber' => $this->subscriber,
            ],
        );
    }
}
