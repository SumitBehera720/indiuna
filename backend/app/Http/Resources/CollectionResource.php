<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class CollectionResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'description' => $this->description,
            'image' => $this->image,
            'banner' => $this->banner,
            'is_active' => $this->is_active,
            'is_featured' => $this->is_featured,
            'products_count' => $this->whenCounted('products'),
        ];
    }
}
