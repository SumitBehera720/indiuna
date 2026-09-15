<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class OrderResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'order_number' => $this->order_number,
            'customer' => CustomerResource::make($this->whenLoaded('customer')),
            'email' => $this->email,
            'phone' => $this->phone,
            'status' => $this->status?->value,
            'payment_status' => $this->payment_status?->value,
            'shipping_status' => $this->shipping_status?->value,
            'fulfillment_status' => $this->fulfillment_status,
            'currency' => $this->currency,
            'subtotal' => $this->subtotal,
            'discount' => $this->discount_total,
            'shipping_cost' => $this->shipping_total,
            'tax' => $this->tax_total,
            'total' => $this->grand_total,
            'paid_amount' => $this->paid_total,
            'due_amount' => $this->due_total,
            'refund_amount' => $this->refund_total,
            'payment_method' => $this->payment_method,
            'shipping_method' => $this->shipping_method,
            'shipping_method_name' => $this->shipping_method_name,
            'coupon_code' => $this->coupon_code,
            'items' => OrderItemResource::collection($this->whenLoaded('items')),
            'status_history' => $this->whenLoaded('statusHistory', fn() => $this->statusHistory->map(fn($history) => [
                'id' => $history->id,
                'status' => $history->status,
                'notes' => $history->notes,
                'created_at' => $history->created_at?->toISOString(),
            ])),
            'payments' => $this->whenLoaded('payments', fn() => $this->payments->map(fn($payment) => [
                'id' => $payment->id,
                'method' => $payment->payment_method,
                'amount' => $payment->amount,
                'status' => $payment->status?->value,
                'transaction_id' => $payment->transaction_id,
                'paid_at' => $payment->paid_at?->toISOString(),
            ])),
            'shipments' => $this->whenLoaded('shipments', fn() => $this->shipments->map(fn($shipment) => [
                'id' => $shipment->id,
                'tracking_number' => $shipment->tracking_number,
                'carrier' => $shipment->carrier,
                'status' => $shipment->status?->value,
                'shipped_at' => $shipment->shipped_at?->toISOString(),
            ])),
            'shipping_address' => $this->shipping_address,
            'billing_address' => $this->billing_address,
            'notes' => $this->notes,
            'source' => $this->source,
            'channel' => $this->channel,
            'placed_at' => $this->created_at?->toISOString(),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
