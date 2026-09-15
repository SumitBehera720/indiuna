<?php

namespace App\Console\Commands;

use App\Enums\ShippingStatus;
use App\Models\Shipment;
use App\Services\ShiprocketService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;
use RuntimeException;
use Throwable;

class SyncShipmentTracking extends Command
{
    protected $signature = 'indiuna:sync-shipment-tracking';

    protected $description = 'Refresh tracking status for in-transit Shiprocket shipments';

    public function __construct(
        private readonly ShiprocketService $shiprocket,
    ) {
        parent::__construct();
    }

    public function handle(): int
    {
        if (!$this->shiprocket->isEnabled()) {
            $this->info('Shiprocket is not enabled — skipping.');

            return self::SUCCESS;
        }

        $shipments = Shipment::whereNotNull('tracking_number')
            ->whereIn('status', [
                ShippingStatus::Shipped->value,
                ShippingStatus::InTransit->value,
                ShippingStatus::OutForDelivery->value,
            ])
            ->limit(50)
            ->get();

        foreach ($shipments as $shipment) {
            try {
                $data = $this->shiprocket->track($shipment->tracking_number);

                $statuses = $data['tracking_data']['tracking_status'] ?? [];

                $latest = $statuses[0]['status'] ?? null;

                if ($latest && stripos($latest, 'delivered') !== false) {
                    $shipment->update([
                        'status' => ShippingStatus::Delivered->value,
                        'delivered_at' => now(),
                    ]);

                    $shipment->order?->update([
                        'status' => \App\Enums\OrderStatus::Delivered->value,
                        'fulfillment_status' => 'delivered',
                        'shipping_status' => ShippingStatus::Delivered->value,
                        'delivered_at' => now(),
                    ]);

                    $this->info("AWB {$shipment->tracking_number} delivered");
                }
            } catch (Throwable $e) {
                Log::warning('Shipment tracking sync failed', [
                    'awb' => $shipment->tracking_number,
                    'error' => $e->getMessage(),
                ]);
            }
        }

        $this->info('Shipment tracking sync completed.');

        return self::SUCCESS;
    }
}
