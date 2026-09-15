<?php

namespace App\Mail;

use Symfony\Component\Mailer\Transport\AbstractTransport;
use Symfony\Component\Mailer\SentMessage;
use Symfony\Component\Mime\MessageConverter;
use Illuminate\Support\Facades\Http;

class BrevoTransport extends AbstractTransport
{
    protected string $apiKey;

    public function __construct(string $apiKey)
    {
        parent::__construct();
        $this->apiKey = $apiKey;
    }

    protected function doSend(SentMessage $message): void
    {
        $email = MessageConverter::toEmail($message->getOriginalMessage());

        $senderAddress = $email->getFrom()[0]->getAddress() ?? config('mail.from.address');
        $senderName = $email->getFrom()[0]->getName() ?: config('mail.from.name');

        $payload = [
            'sender' => [
                'name' => $senderName,
                'email' => $senderAddress,
            ],
            'to' => array_map(fn($addr) => array_filter([
                'name' => $addr->getName() ?: null,
                'email' => $addr->getAddress(),
            ]), $email->getTo()),
            'subject' => $email->getSubject() ?? 'Notification',
        ];

        $htmlBody = $email->getHtmlBody();
        $textBody = $email->getTextBody();

        if ($htmlBody) {
            $payload['htmlContent'] = is_resource($htmlBody) ? stream_get_contents($htmlBody) : (string)$htmlBody;
        }
        if ($textBody) {
            $payload['textContent'] = is_resource($textBody) ? stream_get_contents($textBody) : (string)$textBody;
        }

        if (empty($payload['htmlContent']) && empty($payload['textContent'])) {
            $payload['textContent'] = ' ';
        }

        $response = Http::withoutVerifying()->withHeaders([
            'api-key' => $this->apiKey,
            'Content-Type' => 'application/json',
            'Accept' => 'application/json',
        ])->post('https://api.brevo.com/v3/smtp/email', $payload);

        if (!$response->successful()) {
            throw new \RuntimeException('Brevo API Error: ' . $response->body());
        }
    }

    public function __toString(): string
    {
        return 'brevo';
    }
}
