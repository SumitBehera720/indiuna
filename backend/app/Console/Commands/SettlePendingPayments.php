<?php

namespace App\Console\Commands;

use App\Enums\PaymentStatus;
use App\Models\Payment;
use App\Services\CheckoutService;
use App\Services\PaymentService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;
use Throwable;

class SettlePendingPayments extends Command
{
    protected $signature = 'indiuna:settle-pending-payments';

    protected $description = 'Settle Razorpay payments that were paid at the gateway but never confirmed by webhook or storefront';

    public function __construct(
        private readonly PaymentService $paymentService,
        private readonly CheckoutService $checkoutService,
    ) {
        parent::__construct();
    }

    public function handle(): int
    {
        if (!$this->paymentService->razorpayEnabled()) {
            $this->info('Razorpay is not enabled — skipping.');

            return self::SUCCESS;
        }

        $payments = Payment::query()
            ->where('payment_method', 'razorpay')
            ->where('status', PaymentStatus::Pending->value)
            ->where('created_at', '<', now()->subMinutes(10))
            ->get();

        $settled = 0;

        foreach ($payments as $payment) {
            $gatewayOrderId = $payment->gateway_response['razorpay_order_id'] ?? null;

            if (!$gatewayOrderId) {
                continue;
            }

            try {
                $gatewayOrder = $this->paymentService->fetchRazorpayOrder($gatewayOrderId);

                if (!$gatewayOrder || (int) ($gatewayOrder['amount_paid'] ?? 0) <= 0) {
                    continue;
                }

                $razorpayPaymentId = null;

                foreach ($this->paymentService->fetchRazorpayOrderPayments($gatewayOrderId)['items'] ?? [] as $item) {
                    if (in_array($item['status'] ?? '', ['paid', 'authorized'], true)) {
                        $razorpayPaymentId = $item['id'];
                        break;
                    }
                }

                if (!$razorpayPaymentId) {
                    continue;
                }

                $this->checkoutService->settlePayment(
                    $payment,
                    $razorpayPaymentId,
                    (int) round((float) $gatewayOrder['amount_paid'])
                );

                $settled++;
                $this->info("Settled payment {$payment->id} via Razorpay payment {$razorpayPaymentId}");
            } catch (Throwable $e) {
                Log::warning('Pending payment reconciliation failed', [
                    'payment_id' => $payment->id,
                    'error' => $e->getMessage(),
                ]);
            }
        }

        $this->info("Reconciliation complete — settled {$settled} payment(s).");

        return self::SUCCESS;
    }
}