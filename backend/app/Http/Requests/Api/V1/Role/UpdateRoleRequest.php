<?php

namespace App\Http\Requests\Api\V1\Role;

use Illuminate\Foundation\Http\FormRequest;

class UpdateRoleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['sometimes', 'string', 'unique:roles,name'],
            'permissions' => ['sometimes', 'array'],
        ];
    }
}
