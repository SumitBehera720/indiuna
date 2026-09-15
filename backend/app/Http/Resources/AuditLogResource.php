<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class AuditLogResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'event_type' => $this->event_type,
            'actor' => $this->whenLoaded('actor', fn() => [
                'name' => $this->actor->name ?? $this->actor->email,
                'email' => $this->actor->email ?? null,
            ]),
            'target' => $this->whenLoaded('target', fn() => [
                'type' => class_basename($this->target_type),
                'id' => $this->target_id,
            ]),
            'action' => $this->action,
            'changes' => $this->changes,
            'ip_address' => $this->ip_address,
            'browser' => $this->browser,
            'device' => $this->device,
            'created_at' => $this->created_at?->toISOString(),
        ];
    }
}
