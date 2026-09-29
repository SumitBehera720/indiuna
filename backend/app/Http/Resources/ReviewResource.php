<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class ReviewResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'product_id' => $this->product_id,
            'product' => $this->whenLoaded('product', fn() => [
                'id' => $this->product->id,
                'name' => $this->product->name,
                'image' => $this->product->images->where('is_primary', true)->first()?->url ?? $this->product->images->first()?->url,
            ]),
            'customer' => CustomerResource::make($this->whenLoaded('customer')),
            'rating' => $this->rating,
            'title' => $this->title,
            'body' => $this->body,
            'comment' => $this->body,
            'status' => $this->is_approved ? 'approved' : 'pending',
            'is_approved' => $this->is_approved,
            'is_featured' => $this->is_featured,
            'helpful_count' => $this->helpful_count,
            'created_at' => $this->created_at?->toISOString(),
        ];
    }
}
