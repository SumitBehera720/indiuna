<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class ShippingZoneResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'description' => $this->description,
            'countries' => $this->countries,
            'states' => $this->states,
            'postal_codes' => $this->postal_codes,
            'is_active' => $this->is_active,
            'shipping_rates' => ShippingRateResource::collection($this->whenLoaded('shippingRates')),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
