<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class GiftCardResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'code' => $this->code,
            'initial_balance' => $this->initial_balance,
            'current_balance' => $this->current_balance,
            'currency' => $this->currency,
            'recipient_email' => $this->recipient_email,
            'recipient_name' => $this->recipient_name,
            'message' => $this->message,
            'status' => $this->status,
            'expires_at' => $this->expires_at?->toISOString(),
            'customer' => CustomerResource::make($this->whenLoaded('customer')),
            'transactions' => GiftCardTransactionResource::collection($this->whenLoaded('transactions')),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
