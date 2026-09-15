<?php

namespace App\Http\Controllers\Api\V1;

use App\Enums\OrderStatus;
use App\Enums\ShippingStatus;
use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Shipment;
use App\Services\ShiprocketService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use RuntimeException;
use Throwable;

class ShiprocketController extends Controller
{
    public function __construct(
        private readonly ShiprocketService $shiprocket,
    ) {}

    /**
     * Create the Shiprocket shipment + assign AWB + label.
     */
    public function ship(Request $request, string $orderId): JsonResponse
    {
        $request->validate([
            'courier_id' => ['required', 'string'],
        ]);

        if (!$this->shiprocket->isEnabled()) {
            return $this->error('Shiprocket is not configured', 400);
        }

        $order = Order::with(['items.variant'])->findOrFail($orderId);

        if ($order->shipments()->whereNull('deleted_at')->count() > 0) {
            return $this->error('Order already has an active shipment', 400);
        }

        try {
            $result = DB::transaction(function () use ($order, $request) {
                $payload = $this->shiprocket->buildOrderPayload(
                    $order,
                    $request->input('courier_id'),
                );

                $created = $this->shiprocket->createOrder($payload);

                $awbResult = $this->shiprocket->assignAWB(
                    $created['shipment_id'],
                    $created['courier_company_id'] ?: $request->input('courier_id'),
                );

                $shipment = $order->shipments()->create([
                    'tracking_number' => $awbResult['awb'],
                    'carrier' => $this->shiprocket->isEnabled() ? 'Shiprocket' : null,
                    'service' => $created['courier_company_id'],
                    'status' => ShippingStatus::Shipped->value,
                    'shipping_cost' => $order->shipping_total,
                    'shipped_at' => now(),
                    'notes' => 'Shipment created via Shiprocket',
                    'meta_data' => [
                        'shiprocket_order_id' => $created['order_id'],
                        'shipment_id' => $created['shipment_id'],
                        'courier_id' => $request->input('courier_id'),
                        'label_url' => $awbResult['label_url'],
                        'invoice_url' => $awbResult['invoice_url'],
                    ],
                ]);

                if ($order->status === OrderStatus::Confirmed || $order->status === OrderStatus::Pending) {
                    $order->update([
                        'status' => OrderStatus::Shipped->value,
                        'fulfillment_status' => 'shipped',
                        'shipping_status' => ShippingStatus::Shipped->value,
                        'shipped_at' => now(),
                    ]);
                }

                $order->timeline()->create([
                    'status' => OrderStatus::Shipped->value,
                    'notes' => "Shipped via Shiprocket — AWB {$awbResult['awb']}",
                ]);

                return $shipment;
            });

            return $this->success($result, 'Shipment created successfully', 201);
        } catch (RuntimeException $e) {
            return $this->error('Shiprocket: ' . $e->getMessage(), 502);
        } catch (Throwable $e) {
            return $this->error('Unable to create shipment: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Track an existing Shiprocket shipment.
     */
    public function tracking(string $orderId): JsonResponse
    {
        $order = Order::findOrFail($orderId);
        $shipment = $order->shipments()->whereNotNull('tracking_number')->latest()->first();

        if (!$shipment) {
            return $this->error('No shipment found for this order', 404);
        }

        try {
            $data = $this->shiprocket->track($shipment->tracking_number);

            $this->syncShipmentStatus($shipment, $data);

            return $this->success([
                'shipment' => $shipment->fresh(['tracking']),
                'tracking' => $data['tracking_data']['tracking_status'] ?? [],
            ], 'Tracking fetched successfully');
        } catch (RuntimeException $e) {
            return $this->error('Shiprocket: ' . $e->getMessage(), 502);
        }
    }

    /**
     * Cancel the Shiprocket shipment (AWB).
     */
    public function cancel(string $orderId): JsonResponse
    {
        $order = Order::findOrFail($orderId);
        $shipment = $order->shipments()->whereNotNull('tracking_number')->latest()->first();

        if (!$shipment) {
            return $this->error('No shipment found for this order', 404);
        }

        try {
            $this->shiprocket->cancelByAWB($shipment->tracking_number);

            $shipment->update([
                'status' => 'cancelled',
            ]);

            $order->timeline()->create([
                'status' => $order->status->value,
                'notes' => "Shipment cancelled — AWB {$shipment->tracking_number}",
            ]);

            return $this->success(null, 'Shipment cancelled successfully');
        } catch (RuntimeException $e) {
            return $this->error('Shiprocket: ' . $e->getMessage(), 502);
        }
    }

    /**
     * Reconcile a shipment's status from Shiprocket tracking data.
     */
    public function syncShipmentStatus(Shipment $shipment, array $trackingData): void
    {
        $statuses = $trackingData['tracking_data']['tracking_status'] ?? [];

        if (empty($statuses)) {
            return;
        }

        $latest = $statuses[0]['status'] ?? null;

        if (!$latest) {
            return;
        }

        $map = [
            'delivered' => ShippingStatus::Delivered,
            'out_for_delivery' => ShippingStatus::OutForDelivery,
            'in_transit' => ShippingStatus::InTransit,
            'picked_up' => ShippingStatus::InTransit,
            'shipment created' => ShippingStatus::Shipped,
            'label_created' => ShippingStatus::Shipped,
            'rto' => ShippingStatus::Returned,
            'cancelled' => ShippingStatus::Failed,
            'undelivered' => ShippingStatus::Failed,
        ];

        $normalized = strtolower(trim($latest));

        foreach ($map as $keyword => $status) {
            if (str_contains($normalized, $keyword)) {
                $shipment->update(['status' => $status->value]);
                break;
            }
        }

        if ($shipment->status->isDelivered() && !$shipment->delivered_at) {
            $shipment->update(['delivered_at' => now()]);
            $shipment->order->update([
                'status' => OrderStatus::Delivered->value,
                'fulfillment_status' => 'delivered',
                'shipping_status' => ShippingStatus::Delivered->value,
                'delivered_at' => now(),
            ]);

            $shipment->order->timeline()->create([
                'status' => OrderStatus::Delivered->value,
                'notes' => 'Order delivered',
            ]);
        }

        foreach ($statuses as $entry) {
            $shipment->tracking()->firstOrCreate(
                ['status' => (string) ($entry['status'] ?? 'unknown')],
                [
                    'location' => $entry['location'] ?? null,
                    'description' => $entry['activity'] ?? null,
                    'tracked_at' => isset($entry['date']) && isset($entry['time'])
                        ? now()->parse($entry['date'] . ' ' . $entry['time'])
                        : now(),
                    'meta_data' => $entry,
                ],
            );
        }
    }
}
