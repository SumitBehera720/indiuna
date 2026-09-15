<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class TaxRateResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'rate' => $this->rate,
            'type' => $this->type,
            'country' => $this->country,
            'state' => $this->state,
            'postal_code' => $this->postal_code,
            'is_compound' => $this->is_compound,
            'applies_to' => $this->applies_to,
            'priority' => $this->priority,
            'is_active' => $this->is_active,
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
