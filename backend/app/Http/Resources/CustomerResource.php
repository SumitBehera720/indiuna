<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class CustomerResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'first_name' => $this->first_name,
            'last_name' => $this->last_name,
            'email' => $this->email,
            'phone' => $this->phone,
            'avatar' => $this->avatar,
            'date_of_birth' => $this->date_of_birth,
            'gender' => $this->gender,
            'is_active' => $this->is_active,
            'is_verified' => $this->is_verified,
            'total_orders' => $this->total_orders,
            'total_spent' => $this->total_spent,
            'average_order_value' => $this->average_order_value,
            'customer_group' => $this->customer_group,
            'addresses' => AddressResource::collection($this->whenLoaded('addresses')),
            'last_purchased_at' => $this->last_purchased_at?->toISOString(),
            'created_at' => $this->created_at?->toISOString(),
        ];
    }
}
