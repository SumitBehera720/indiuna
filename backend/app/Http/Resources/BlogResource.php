<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class BlogResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'slug' => $this->slug,
            'excerpt' => $this->excerpt,
            'body' => $this->body,
            'featured_image' => $this->featured_image,
            'tags' => $this->tags,
            'is_published' => $this->is_published,
            'published_at' => $this->published_at?->toISOString(),
            'category' => BlogCategoryResource::make($this->whenLoaded('category')),
            'author' => $this->whenLoaded('author', fn() => [
                'name' => $this->author->name,
            ]),
            'seo_title' => $this->seo_title,
            'seo_description' => $this->seo_description,
            'created_at' => $this->created_at?->toISOString(),
        ];
    }
}
