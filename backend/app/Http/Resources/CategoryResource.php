<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class CategoryResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'parent_id' => $this->parent_id,
            'parent' => $this->whenLoaded('parent', fn() => $this->parent ? ['id' => $this->parent->id, 'name' => $this->parent->name] : null),
            'description' => $this->description,
            'icon' => $this->icon,
            'banner' => $this->banner,
            'image' => $this->image,
            'redirect_to' => $this->redirect_to,
            'show_in_pages' => $this->show_in_pages,
            'gender' => $this->gender ?? 'all',
            'sort_order' => $this->sort_order,
            'is_active' => $this->is_active,
            'is_featured' => $this->is_featured,
            'products_count' => $this->whenCounted('products'),
            'children_count' => $this->whenCounted('children'),
            'children' => CategoryResource::collection($this->whenLoaded('children')),
            'created_at' => $this->created_at?->toISOString(),
        ];
    }
}
