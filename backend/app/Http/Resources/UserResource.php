<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id'         => $this->id,
            'name'       => trim($this->first_name . ' ' . $this->last_name),
            'first_name' => $this->first_name,
            'last_name'  => $this->last_name,
            'email'      => $this->email,
            'phone'      => $this->phone,
            'avatar'     => $this->avatar,
            'role'       => $this->roles->first()?->name ?? 'customer',
            'roles'      => $this->roles->pluck('name'),
            'permissions'=> $this->whenLoaded('permissions', fn() => $this->getAllPermissions()->pluck('name')),
            'created_at' => $this->created_at?->toISOString(),
        ];
    }
}
