<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class BannerResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'subtitle' => $this->subtitle,
            'description' => $this->description,
            'image' => $this->image_url ?? $this->image,
            'image_url' => $this->image_url,
            'mobile_image' => $this->mobile_image_url ?? $this->mobile_image,
            'mobile_image_url' => $this->mobile_image_url,
            'link' => $this->link_url ?? $this->link,
            'link_url' => $this->link_url,
            'link_text' => $this->link_text,
            'position' => $this->position,
            'sort_order' => $this->sort_order,
            'is_active' => $this->is_active,
        ];
    }
}
