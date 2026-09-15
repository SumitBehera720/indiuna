<?php
declare(strict_types=1);

namespace App\Jobs;

use App\Mail\Order\AbandonedCartReminder;
use App\Models\Cart;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class ProcessAbandonedCart implements ShouldQueue
{
    use Queueable;

    public function __construct(
        private readonly int $abandonedHours = 24,
    ) {}

    public function handle(): void
    {
        $threshold = now()->subHours($this->abandonedHours);

        $abandonedCarts = Cart::with(['items', 'customer'])
            ->where('is_active', true)
            ->where('updated_at', '<', $threshold)
            ->whereHas('items')
            ->get();

        foreach ($abandonedCarts as $cart) {
            if (!$cart->customer || !$cart->customer->email) {
                continue;
            }

            try {
                Mail::to($cart->customer->email)
                    ->send(new AbandonedCartReminder($cart));

                $cart->update(['abandoned_email_sent_at' => now()]);

                Log::info("Abandoned cart reminder sent to {$cart->customer->email}");
            } catch (\Exception $e) {
                Log::error("Failed to send abandoned cart email: {$e->getMessage()}");
            }
        }
    }
}
