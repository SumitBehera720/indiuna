<?php

namespace App\Http\Controllers\Api\V1;

use App\Enums\PaymentStatus;
use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Services\CheckoutService;
use App\Services\PaymentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Throwable;

class RazorpayWebhookController extends Controller
{
    public function __construct(
        private readonly PaymentService $paymentService,
        private readonly CheckoutService $checkoutService,
    ) {}

    public function handle(Request $request): JsonResponse
    {
        $rawBody = $request->getContent();
        $signature = $request->header('X-Razorpay-Signature');

        if (!$signature || !$this->paymentService->verifyWebhookSignature($rawBody, $signature)) {
            Log::warning('Razorpay webhook rejected: invalid signature');

            return response()->json(['status' => 'invalid_signature'], 400);
        }

        $payload = json_decode($rawBody, true);

        if (!is_array($payload)) {
            return response()->json(['status' => 'invalid_payload'], 400);
        }

        $event = $payload['event'] ?? null;

        if (!in_array($event, ['payment.captured', 'payment.failed'], true)) {
            return response()->json(['status' => 'ignored']);
        }

        $entity = $payload['payload']['payment']['entity'] ?? null;

        if (!is_array($entity)) {
            return response()->json(['status' => 'ignored']);
        }

        $razorpayOrderId = $entity['order_id'] ?? null;
        $razorpayPaymentId = $entity['id'] ?? null;
        $amountPaise = (int) ($entity['amount'] ?? 0);

        if (!$razorpayOrderId || !$razorpayPaymentId) {
            return response()->json(['status' => 'ignored']);
        }

        try {
            $payment = Payment::where('status', PaymentStatus::Pending->value)
                ->where('gateway_response->razorpay_order_id', $razorpayOrderId)
                ->latest()
                ->first();

            if (!$payment) {
                Log::info('Razorpay webhook: no pending payment for order', [
                    'razorpay_order_id' => $razorpayOrderId,
                ]);

                return response()->json(['status' => 'not_found']);
            }

            if ($event === 'payment.captured') {
                $this->checkoutService->settlePayment($payment, $razorpayPaymentId, $amountPaise);

                return response()->json(['status' => 'processed']);
            }

            $payment->update([
                'status' => PaymentStatus::Failed->value,
                'gateway_response' => array_merge($payment->gateway_response ?? [], [
                    'razorpay_payment_id' => $razorpayPaymentId,
                    'failed_at' => now()->toIso8601String(),
                    'failure_reason' => $entity['error_description'] ?? null,
                ]),
            ]);

            $payment->order->update([
                'payment_status' => PaymentStatus::Failed->value,
            ]);

            $payment->order->timeline()->create([
                'status' => $payment->order->status->value,
                'notes' => 'Payment failed via Razorpay',
            ]);

            return response()->json(['status' => 'processed']);
        } catch (Throwable $e) {
            Log::error('Razorpay webhook processing failed', [
                'event' => $event,
                'error' => $e->getMessage(),
            ]);

            return response()->json(['status' => 'error'], 500);
        }
    }
}
