<?php
declare(strict_types=1);

namespace App\Jobs;

use App\Mail\Order\ShipmentConfirmation;
use App\Models\Shipment;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class SendShipmentNotification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        private readonly string $shipmentId,
    ) {}

    public function handle(): void
    {
        $shipment = Shipment::with(['order.customer'])->find($this->shipmentId);

        if (!$shipment || !$shipment->order) {
            Log::warning("Shipment or order not found: {$this->shipmentId}");
            return;
        }

        $email = $shipment->order->customer?->email;

        if (!$email) {
            Log::warning("No customer email for shipment: {$this->shipmentId}");
            return;
        }

        Mail::to($email)->send(new ShipmentConfirmation($shipment));

        Log::info("Shipment notification sent to {$email} for shipment {$shipment->id}");
    }
}
