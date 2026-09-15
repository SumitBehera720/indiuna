<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class PurchaseOrderResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'order_number' => $this->order_number,
            'supplier_id' => $this->supplier_id,
            'user_id' => $this->user_id,
            'status' => $this->status,
            'subtotal' => $this->subtotal,
            'tax_amount' => $this->tax_amount,
            'shipping_cost' => $this->shipping_cost,
            'total' => $this->total,
            'notes' => $this->notes,
            'expected_at' => $this->expected_at?->toISOString(),
            'received_at' => $this->received_at?->toISOString(),
            'supplier' => SupplierResource::make($this->whenLoaded('supplier')),
            'user' => UserResource::make($this->whenLoaded('user')),
            'items' => PurchaseOrderItemResource::collection($this->whenLoaded('items')),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
