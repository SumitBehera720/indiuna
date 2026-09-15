<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class RefundResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'order_id' => $this->order_id,
            'return_id' => $this->return_id,
            'refund_number' => $this->refund_number,
            'status' => $this->status,
            'amount' => $this->amount,
            'reason' => $this->reason,
            'processed_at' => $this->processed_at?->toISOString(),
        ];
    }
}
