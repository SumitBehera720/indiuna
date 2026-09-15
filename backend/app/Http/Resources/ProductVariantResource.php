<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class ProductVariantResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'sku' => $this->sku,
            'barcode' => $this->barcode,
            'price' => $this->price,
            'compare_price' => $this->compare_price,
            'cost_price' => $this->cost_price,
            'attributes' => $this->attributes,
            'image' => $this->attributes['image'] ?? null,
            'stock' => $this->stock,
            'weight' => $this->weight,
            'dimensions' => [
                'length' => $this->length,
                'width' => $this->width,
                'height' => $this->height,
            ],
            'is_active' => $this->is_active,
            'images' => $this->whenLoaded('images', fn() => $this->images->map(fn($img) => [
                'id' => $img->id,
                'url' => $img->url ?? $img->path,
                'thumbnail_url' => $img->thumbnail_url ?? null,
                'is_primary' => $img->is_primary ?? false,
            ])),
        ];
    }
}
