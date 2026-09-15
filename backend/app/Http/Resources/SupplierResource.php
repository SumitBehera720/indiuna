<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class SupplierResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'code' => $this->code,
            'contact_person' => $this->contact_person,
            'email' => $this->email,
            'phone' => $this->phone,
            'address_line1' => $this->address_line1,
            'address_line2' => $this->address_line2,
            'city' => $this->city,
            'state' => $this->state,
            'postal_code' => $this->postal_code,
            'country' => $this->country,
            'website' => $this->website,
            'tax_id' => $this->tax_id,
            'payment_terms' => $this->payment_terms,
            'credit_limit' => $this->credit_limit,
            'notes' => $this->notes,
            'is_active' => $this->is_active,
            'status' => $this->status,
            'meta_data' => $this->meta_data,
            'purchase_orders' => PurchaseOrderResource::collection($this->whenLoaded('purchaseOrders')),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
