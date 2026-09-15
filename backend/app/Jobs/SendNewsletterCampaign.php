<?php
declare(strict_types=1);

namespace App\Jobs;

use App\Mail\NewsletterCampaign;
use App\Models\NewsletterSubscriber;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class SendNewsletterCampaign implements ShouldQueue
{
    use Queueable;

    public function __construct(
        private readonly string $campaignId,
        private readonly int $batchSize = 100,
    ) {}

    public function handle(): void
    {
        $subscribers = NewsletterSubscriber::where('is_active', true)
            ->whereNull('unsubscribed_at')
            ->get();

        $chunks = $subscribers->chunk($this->batchSize);

        foreach ($chunks as $chunk) {
            foreach ($chunk as $subscriber) {
                try {
                    Mail::to($subscriber->email)
                        ->queue(new NewsletterCampaign($this->campaignId, $subscriber));
                } catch (\Exception $e) {
                    Log::error("Failed to send campaign to {$subscriber->email}: {$e->getMessage()}");
                }
            }
        }

        if (class_exists(\App\Models\NewsletterCampaign::class)) {
            $campaign = \App\Models\NewsletterCampaign::find($this->campaignId);
        }
        if (isset($campaign) && $campaign) {
            $campaign->update([
                'sent_count' => $subscribers->count(),
                'sent_at' => now(),
                'status' => 'sent',
            ]);
        }

        Log::info("Newsletter campaign {$this->campaignId} sent to {$subscribers->count()} subscribers");
    }
}
