<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class ProductResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'brand' => BrandResource::make($this->whenLoaded('brand')),
            'short_description' => $this->short_description,
            'description' => $this->description,
            'type' => $this->type,
            'status' => $this->status,
            'gender' => $this->gender ?? 'unisex',
            'is_featured' => $this->is_featured,
            'tags' => $this->tags,
            'seo_title' => $this->seo_title,
            'seo_description' => $this->seo_description,
            'size_guide_image' => $this->size_guide_image,
            'price' => $this->relationLoaded('variants') ? (float) $this->variants->min('price') : null,
            'compare_price' => $this->relationLoaded('variants') ? (float) $this->variants->min('compare_price') : null,
            'stock' => $this->relationLoaded('variants') ? (int) $this->variants->sum('stock') : null,
            'variants' => ProductVariantResource::collection($this->whenLoaded('variants')),
            'images' => $this->whenLoaded('images', fn() => $this->images->map(fn($img) => [
                'id' => $img->id,
                'url' => $img->url ?? $img->path,
                'thumbnail_url' => $img->thumbnail_url ?? null,
                'width' => $img->width,
                'height' => $img->height,
                'file_size' => $img->file_size,
                'is_primary' => $img->is_primary ?? false,
                'sort_order' => $img->sort_order ?? 0,
            ])),
            'categories' => CategoryResource::collection($this->whenLoaded('categories')),
            'collections' => CollectionResource::collection($this->whenLoaded('collections')),
            'reviews_count' => $this->whenCounted('reviews'),
            'average_rating' => $this->when($this->reviews_avg_rating, fn() => round($this->reviews_avg_rating, 1)),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
