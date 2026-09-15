<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class OrderItemResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'product_id' => $this->product_id,
            'variant_id' => $this->variant_id,
            'name' => $this->product_name,
            'product_name' => $this->product_name,
            'variant_label' => $this->variant_label,
            'sku' => $this->product_sku,
            'image' => $this->image_url,
            'quantity' => $this->quantity,
            'price' => $this->unit_price,
            'unit_price' => $this->unit_price,
            'subtotal' => $this->subtotal,
            'discount_amount' => $this->discount_total,
            'tax_amount' => $this->tax_total,
            'total' => $this->grand_total,
            'meta_data' => $this->meta_data,
        ];
    }
}
