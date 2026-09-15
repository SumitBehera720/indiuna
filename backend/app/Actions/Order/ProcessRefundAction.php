<?php
declare(strict_types=1);

namespace App\Actions\Order;

use App\Enums\PaymentStatus;
use App\Models\Order;
use App\Models\Refund;
use App\Repositories\OrderRepository;
use Illuminate\Support\Facades\DB;

class ProcessRefundAction
{
    public function __construct(
        private readonly OrderRepository $orderRepository,
    ) {}

    public function execute(string $orderId, float $amount, string $reason, ?string $returnId = null): Refund
    {
        return DB::transaction(function () use ($orderId, $amount, $reason, $returnId) {
            $order = $this->orderRepository->findOrFail($orderId);

            $refund = Refund::create([
                'order_id' => $order->id,
                'return_id' => $returnId,
                'amount' => $amount,
                'reason' => $reason,
                'status' => 'pending',
                'processed_by' => auth()->id(),
                'processed_at' => now(),
            ]);

            if ($returnId) {
                $returnModel = $order->returns()->find($returnId);
                if ($returnModel) {
                    $returnModel->items()->whereNull('refunded_at')->update(['refunded_at' => now()]);
                    $returnModel->update(['status' => 'refunded']);
                }
            }

            $totalRefunded = (float) $order->refunds()->sum('amount');
            $newPaymentStatus = $totalRefunded >= (float) $order->total
                ? PaymentStatus::Refunded
                : PaymentStatus::PartiallyRefunded;

            $order->update([
                'payment_status' => $newPaymentStatus,
                'status' => $newPaymentStatus === PaymentStatus::Refunded ? \App\Enums\OrderStatus::Refunded : $order->status,
            ]);

            $this->processPaymentGateway($refund);

            $refund->update(['status' => 'completed']);

            // Send refund notification via notification service
            $notificationService = app(\App\Services\NotificationService::class);
            $user = $order->customer?->user;
            if ($user) {
                // Dispatch refund notification
                \App\Jobs\ProcessRefund::dispatch($refund->id);
            }

            return $refund->fresh();
        });
    }

    private function processPaymentGateway(Refund $refund): void
    {
        // Stub: Integrate with actual payment gateway
        // $gateway = app(PaymentGatewayService::class);
        // $gateway->refund($refund->payment->transaction_id, $refund->amount);
    }
}
