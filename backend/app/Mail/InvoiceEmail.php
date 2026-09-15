<?php
declare(strict_types=1);

namespace App\Mail;

use App\Models\Invoice;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Attachment;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class InvoiceEmail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public Invoice $invoice,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "Invoice - #{$this->invoice->invoice_number}",
        );
    }

    public function content(): Content
    {
        return new Content(
            markdown: 'emails.invoice.notification',
            with: [
                'invoice' => $this->invoice,
                'order' => $this->invoice->order,
                'customer' => $this->invoice->order?->customer,
            ],
        );
    }

    public function attachments(): array
    {
        $pdf = Pdf::loadView('pdfs.invoice', [
            'invoice' => $this->invoice,
            'order' => $this->invoice->order,
        ]);

        return [
            Attachment::fromData(
                fn() => $pdf->output(),
                "invoice-{$this->invoice->invoice_number}.pdf",
            )->withMime('application/pdf'),
        ];
    }
}
