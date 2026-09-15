<?php
declare(strict_types=1);

namespace App\Jobs;

use App\Models\Refund;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;

class ProcessRefund implements ShouldQueue
{
    use Queueable;

    public function __construct(
        private readonly string $refundId,
    ) {}

    public function handle(): void
    {
        $refund = Refund::with(['order.customer'])->find($this->refundId);

        if (!$refund) {
            Log::warning("Refund not found: {$this->refundId}");
            return;
        }

        // Stub: Process through payment gateway
        // $gateway = app(PaymentGatewayService::class);
        // $response = $gateway->refund($refund->payment->transaction_id, $refund->amount);

        $refund->update([
            'status' => 'completed',
            'processed_at' => now(),
        ]);

        Log::info("Refund {$this->refundId} processed successfully");

        SendOrderConfirmationEmail::dispatch($refund->order_id);
    }
}
