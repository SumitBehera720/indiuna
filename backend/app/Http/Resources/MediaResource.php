<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class MediaResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'folder_id' => $this->folder_id,
            'name' => $this->name,
            'file_name' => $this->file_name,
            'mime_type' => $this->mime_type,
            'size' => $this->size >= 1048576
                ? round($this->size / 1048576, 2).' MB'
                : round($this->size / 1024, 2).' KB',
            'width' => $this->width,
            'height' => $this->height,
            'url' => $this->url,
            'thumbnail_url' => $this->thumbnail_url,
            'alt_text' => $this->alt_text,
            'created_at' => $this->created_at?->toISOString(),
        ];
    }
}
