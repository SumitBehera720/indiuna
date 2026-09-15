<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Shipment;
use App\Services\SettingsService;
use App\Services\ShiprocketService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Throwable;

class ShiprocketWebhookController extends Controller
{
    public function __construct(
        private readonly SettingsService $settings,
        private readonly ShiprocketService $shiprocket,
        private readonly ShiprocketController $shiprocketController,
    ) {}

    public function handle(Request $request): JsonResponse
    {
        $token = $this->settings->get('shiprocket_webhook_token');

        if (!$token || $request->query('token') !== $token) {
            Log::warning('Shiprocket webhook rejected: invalid token');

            return response()->json(['status' => 'invalid_token'], 401);
        }

        try {
            $payload = $request->all();

            $shipment = $this->findShipment($payload);

            if (!$shipment) {
                return response()->json(['status' => 'not_found']);
            }

            $this->shiprocketController->syncShipmentStatus($shipment, [
                'tracking_data' => [
                    'tracking_status' => $this->extractStatuses($payload),
                ],
            ]);

            return response()->json(['status' => 'processed']);
        } catch (Throwable $e) {
            Log::error('Shiprocket webhook processing failed', ['error' => $e->getMessage()]);

            return response()->json(['status' => 'error'], 500);
        }
    }

    private function findShipment(array $payload): ?Shipment
    {
        $awb = $payload['awb'] ?? $payload['data']['awb'] ?? null;

        if ($awb) {
            return Shipment::where('tracking_number', $awb)->first();
        }

        $shipmentId = $payload['shipment_id'] ?? $payload['data']['shipment_id'] ?? null;

        if ($shipmentId) {
            return Shipment::where('meta_data->shipment_id', $shipmentId)->first();
        }

        return null;
    }

    private function extractStatuses(array $payload): array
    {
        $status = $payload['current_status'] ?? $payload['status'] ?? $payload['data']['current_status'] ?? null;

        if (!$status) {
            return [];
        }

        return [
            [
                'status' => $status,
                'activity' => $payload['status_message'] ?? $payload['data']['status_message'] ?? null,
                'location' => $payload['location'] ?? $payload['data']['location'] ?? null,
                'date' => $payload['updated_at'] ?? $payload['data']['updated_at'] ?? null,
                'time' => null,
            ],
        ];
    }
}
