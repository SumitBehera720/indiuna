<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class ProductImageResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'product_id' => $this->product_id,
            'variant_id' => $this->variant_id,
            'url' => $this->url ?? $this->path,
            'thumbnail_url' => $this->thumbnail_url,
            'width' => $this->width,
            'height' => $this->height,
            'file_size' => $this->file_size,
            'mime_type' => $this->mime_type,
            'is_primary' => $this->is_primary,
            'sort_order' => $this->sort_order,
            'alt_text' => $this->alt_text,
            'product' => ProductResource::make($this->whenLoaded('product')),
            'variant' => ProductVariantResource::make($this->whenLoaded('variant')),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
