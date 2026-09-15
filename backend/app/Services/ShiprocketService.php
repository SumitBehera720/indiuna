<?php

declare(strict_types=1);

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use RuntimeException;

class ShiprocketService
{
    private const BASE_URL = 'https://apiv2.shiprocket.in/v1/external';

    public function __construct(
        private readonly SettingsService $settings,
    ) {}

    public function isEnabled(): bool
    {
        return $this->settings->getBoolean('shiprocket_enabled', false)
            && $this->settings->get('shiprocket_email')
            && $this->settings->get('shiprocket_password');
    }

    public function pickupPostcode(): ?string
    {
        return $this->settings->get('pickup_postcode') ?: null;
    }

    private function token(): string
    {
        return Cache::remember('shiprocket_token', 3300, function () {
            $email = $this->settings->get('shiprocket_email');
            $password = $this->settings->get('shiprocket_password');

            $response = Http::acceptJson()->post(self::BASE_URL . '/auth/login', [
                'email' => $email,
                'password' => $password,
            ]);

            if ($response->failed() || empty($response->json('token'))) {
                Log::error('Shiprocket auth failed', [
                    'status' => $response->status(),
                    'body' => $response->json(),
                ]);

                throw new RuntimeException('Shiprocket authentication failed');
            }

            return $response->json('token');
        });
    }

    private function request(string $method, string $uri, array $body = [], array $query = []): array
    {
        $token = $this->token();

        $response = Http::withToken($token)
            ->acceptJson()
            ->{$method}(self::BASE_URL . $uri, $method === 'get' ? $query : $body);

        if ($response->status() === 401) {
            Cache::forget('shiprocket_token');
            $token = $this->token();

            $response = Http::withToken($token)
                ->acceptJson()
                ->{$method}(self::BASE_URL . $uri, $method === 'get' ? $query : $body);
        }

        if ($response->failed()) {
            Log::error('Shiprocket request failed', [
                'uri' => $uri,
                'status' => $response->status(),
                'body' => $response->json(),
            ]);

            throw new RuntimeException('Shiprocket request failed');
        }

        return $response->json() ?? [];
    }

    /**
     * Fetch live courier rates for a delivery pincode.
     *
     * @return array<int, array<string, mixed>>
     */
    public function getServiceability(float $weightKg, string $deliveryPostcode, float $declaredValue, bool $cod): array
    {
        if (!$this->isEnabled() || !$this->pickupPostcode()) {
            return [];
        }

        try {
            $data = $this->request('get', '/courier/serviceability/', [], [
                'pickup_postcode' => $this->pickupPostcode(),
                'delivery_postcode' => $deliveryPostcode,
                'cod' => $cod ? 1 : 0,
                'weight' => max($weightKg, 0.1),
                'declared_value' => max($declaredValue, 1),
            ]);

            $available = $data['data']['available_courier_companies'] ?? [];

            $rates = [];

            foreach ($available as $courier) {
                if (($courier['is_cod_available'] ?? true) !== true && $cod) {
                    continue;
                }

                $rates[] = [
                    'courier_id' => (string) $courier['courier_company_id'],
                    'courier_name' => $courier['courier_name'],
                    'rate' => (float) ($courier['rate'] ?? 0),
                    'estimated_delivery_days' => (string) ($courier['estimated_delivery_days'] ?? ''),
                    'rto_charges' => (float) ($courier['rto_charges'] ?? 0),
                    'delivery_charge' => (float) ($courier['freight_charge'] ?? $courier['rate'] ?? 0),
                ];
            }

            usort($rates, fn ($a, $b) => $a['rate'] <=> $b['rate']);

            return $rates;
        } catch (Throwable $e) {
            Log::warning('Shiprocket serviceability lookup failed', ['error' => $e->getMessage()]);

            return [];
        }
    }

    /**
     * Create an order + shipment at Shiprocket.
     *
     * @return array{order_id: string, shipment_id: string, courier_company_id: int|string}
     */
    public function createOrder(array $payload): array
    {
        $data = $this->request('post', '/orders/create', $payload);

        return [
            'order_id' => (string) ($data['order_id'] ?? ''),
            'shipment_id' => (string) ($data['shipment_id'] ?? ''),
            'courier_company_id' => (int) ($data['courier_company_id'] ?? 0),
        ];
    }

    /**
     * Assign an AWB to a created shipment.
     *
     * @return array{awb: string, label_url: string, invoice_url: string}
     */
    public function assignAWB(string $shipmentId, int|string $courierId): array
    {
        $data = $this->request('post', '/courier/assign/awb', [
            'shipment_id' => $shipmentId,
            'courier_id' => $courierId,
        ]);

        $responseData = $data['response'] ?? $data;

        return [
            'awb' => (string) ($responseData['awb_code'] ?? $data['awb_code'] ?? ''),
            'label_url' => (string) ($responseData['label_url'] ?? $data['label_url'] ?? ''),
            'invoice_url' => (string) ($responseData['invoice_url'] ?? $data['invoice_url'] ?? ''),
        ];
    }

    /**
     * Track a shipment by AWB number.
     *
     * @return array<string, mixed>
     */
    public function track(string $awb): array
    {
        return $this->request('post', '/courier/track', ['awb' => $awb]);
    }

    /**
     * Cancel a shipment by AWB.
     */
    public function cancelByAWB(string $awb): array
    {
        return $this->request('post', '/orders/cancel/awb/' . $awb);
    }

    /**
     * Build the order payload Shiprocket expects from an INDIUNA order.
     *
     * @return array<string, mixed>
     */
    public function buildOrderPayload(\App\Models\Order $order, int|string $courierId): array
    {
        $shipping = [
            'first_name' => $order->shipping_first_name,
            'last_name' => $order->shipping_last_name,
            'address' => implode(', ', array_filter([
                $order->shipping_address_line1,
                $order->shipping_address_line2,
            ])),
            'city' => $order->shipping_city,
            'state' => $order->shipping_state,
            'country' => $order->shipping_country,
            'email' => $order->shipping_email,
            'phone' => $order->shipping_phone,
            'postcode' => $order->shipping_postal_code,
        ];

        $items = [];

        foreach ($order->items as $item) {
            $items[] = [
                'name' => $item->product_name,
                'sku' => $item->product_sku ?? 'SKU-' . $item->id,
                'units' => $item->quantity,
                'selling_price' => (float) $item->unit_price,
                'discount' => 0,
                'tax' => (float) $item->tax_total,
                'hsn' => 0,
                'weight' => max((int) round(((float) ($item->variant?->weight ?? 0.5)) * 1000), 100),
            ];
        }

        return [
            'order_id' => $order->order_number,
            'order_date' => $order->created_at->format('Y-m-d H:i:s'),
            'pickup_location' => $this->settings->get('shiprocket_pickup_location', 'Primary'),
            'channel_id' => $this->settings->get('shiprocket_channel_id', ''),
            'comment' => $order->notes ?? '',
            'reseller_name' => $this->settings->get('shiprocket_company_name', 'Indiuna'),
            'company_name' => $this->settings->get('shiprocket_company_name', 'Indiuna'),
            'billing_customer_name' => $shipping['first_name'] . ' ' . $shipping['last_name'],
            'billing_last_name' => $shipping['last_name'],
            'billing_address' => $shipping['address'],
            'billing_city' => $shipping['city'],
            'billing_pincode' => $shipping['postcode'],
            'billing_state' => $shipping['state'],
            'billing_country' => $shipping['country'],
            'billing_email' => $shipping['email'],
            'billing_phone' => $shipping['phone'],
            'shipping_is_billing' => true,
            'shipping_customer_name' => $shipping['first_name'] . ' ' . $shipping['last_name'],
            'shipping_last_name' => $shipping['last_name'],
            'shipping_address' => $shipping['address'],
            'shipping_city' => $shipping['city'],
            'shipping_pincode' => $shipping['postcode'],
            'shipping_state' => $shipping['state'],
            'shipping_country' => $shipping['country'],
            'shipping_email' => $shipping['email'],
            'shipping_phone' => $shipping['phone'],
            'order_items' => $items,
            'payment_method' => $order->payment_status === \App\Enums\PaymentStatus::Completed ? 'Prepaid' : 'COD',
            'shipping_charges' => (float) $order->shipping_total,
            'giftwrap_charges' => 0,
            'transaction_charges' => 0,
            'total_discount' => (float) $order->discount_total,
            'sub_total' => (float) $order->subtotal,
            'length' => 10,
            'breadth' => 10,
            'height' => 10,
            'weight' => max((float) $order->items->sum(fn ($i) => ((float) ($i->variant?->weight ?? 0.5)) * $i->quantity), 0.5),
            'courier_id' => $courierId,
        ];
    }
}
