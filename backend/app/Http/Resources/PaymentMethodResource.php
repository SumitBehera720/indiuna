<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class PaymentMethodResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'code' => $this->code,
            'name' => $this->name,
            'description' => $this->description,
            'icon' => $this->icon,
            'is_active' => $this->is_active,
            'is_test_mode' => $this->is_test_mode,
            'sort_order' => $this->sort_order,
            'configuration' => $this->configuration,
            'supported_currencies' => $this->supported_currencies,
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
