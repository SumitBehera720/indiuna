<?php

declare(strict_types=1);

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use RuntimeException;

class PaymentService
{
    private const RAZORPAY_API = 'https://api.razorpay.com/v1';

    public function __construct(
        private readonly SettingsService $settings,
    ) {}

    public function razorpayEnabled(): bool
    {
        return $this->settings->getBoolean('razorpay_enabled', false)
            && $this->razorpayKeyId() !== null
            && $this->razorpayKeySecret() !== null;
    }

    public function codEnabled(): bool
    {
        return $this->settings->getBoolean('cod_enabled', false);
    }

    public function razorpayKeyId(): ?string
    {
        return $this->settings->get('razorpay_key_id') ?: null;
    }

    public function razorpayKeySecret(): ?string
    {
        return $this->settings->get('razorpay_key_secret') ?: null;
    }

    /**
     * Create a Razorpay order for the given amount (in paise).
     *
     * @return array{id: string, amount: int, currency: string, status: string}
     */
    public function createRazorpayOrder(string $receipt, int $amountPaise): array
    {
        if (!$this->razorpayEnabled()) {
            throw new RuntimeException('Razorpay payments are not enabled');
        }

        $response = Http::withBasicAuth(
            $this->razorpayKeyId(),
            $this->razorpayKeySecret()
        )->acceptJson()->post(self::RAZORPAY_API . '/orders', [
            'amount' => $amountPaise,
            'currency' => 'INR',
            'receipt' => $receipt,
            'payment_capture' => 1,
        ]);

        if ($response->failed()) {
            Log::error('Razorpay order creation failed', [
                'receipt' => $receipt,
                'status' => $response->status(),
                'body' => $response->json(),
            ]);

            throw new RuntimeException('Unable to initialize payment. Please try again.');
        }

        return $response->json();
    }

    /**
     * Verify the HMAC signature returned after a client-side payment.
     */
    public function verifySignature(string $razorpayOrderId, string $razorpayPaymentId, string $signature): bool
    {
        $secret = $this->razorpayKeySecret();

        if ($secret === null) {
            return false;
        }

        $expected = hash_hmac('sha256', "{$razorpayOrderId}|{$razorpayPaymentId}", $secret);

        return hash_equals($expected, $signature);
    }

    /**
     * Verify the webhook signature over the raw request body.
     */
    public function verifyWebhookSignature(string $rawBody, string $signature): bool
    {
        $secret = $this->razorpayKeySecret();

        if ($secret === null) {
            return false;
        }

        $expected = hash_hmac('sha256', $rawBody, $secret);

        return hash_equals($expected, $signature);
    }

    /**
     * Fetch payment details from Razorpay (used for reconciliation).
     *
     * @return array<string, mixed>|null
     */
    public function fetchPayment(string $razorpayPaymentId): ?array
    {
        $response = Http::withBasicAuth(
            $this->razorpayKeyId(),
            $this->razorpayKeySecret()
        )->acceptJson()->get(self::RAZORPAY_API . "/payments/{$razorpayPaymentId}");

        if ($response->failed()) {
            Log::warning('Razorpay payment fetch failed', [
                'payment_id' => $razorpayPaymentId,
                'status' => $response->status(),
            ]);

            return null;
        }

        return $response->json();
    }

    /**
     * Fetch a Razorpay order (for reconciliation of paid-but-unconfirmed orders).
     *
     * @return array<string, mixed>|null
     */
    public function fetchRazorpayOrder(string $razorpayOrderId): ?array
    {
        $response = Http::withBasicAuth(
            $this->razorpayKeyId(),
            $this->razorpayKeySecret()
        )->acceptJson()->get(self::RAZORPAY_API . "/orders/{$razorpayOrderId}");

        if ($response->failed()) {
            Log::warning('Razorpay order fetch failed', [
                'order_id' => $razorpayOrderId,
                'status' => $response->status(),
            ]);

            return null;
        }

        return $response->json();
    }

    /**
     * Fetch the payments captured against a Razorpay order.
     *
     * @return array<string, mixed>
     */
    public function fetchRazorpayOrderPayments(string $razorpayOrderId): array
    {
        $response = Http::withBasicAuth(
            $this->razorpayKeyId(),
            $this->razorpayKeySecret()
        )->acceptJson()->get(self::RAZORPAY_API . "/orders/{$razorpayOrderId}/payments");

        if ($response->failed()) {
            Log::warning('Razorpay order payments fetch failed', [
                'order_id' => $razorpayOrderId,
                'status' => $response->status(),
            ]);

            return [];
        }

        return $response->json() ?? [];
    }
}
