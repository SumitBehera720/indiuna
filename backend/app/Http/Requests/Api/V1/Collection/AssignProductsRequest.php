<?php

namespace App\Http\Requests\Api\V1\Collection;

use Illuminate\Foundation\Http\FormRequest;

class AssignProductsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'product_ids' => ['required', 'array'],
            'product_ids.*' => ['required', 'string'],
        ];
    }
}
