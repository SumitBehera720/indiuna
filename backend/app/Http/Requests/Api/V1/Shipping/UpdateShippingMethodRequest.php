<?php

namespace App\Http\Requests\Api\V1\Shipping;

use Illuminate\Foundation\Http\FormRequest;

class UpdateShippingMethodRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['sometimes', 'string'],
            'price' => ['sometimes', 'numeric', 'min:0'],
        ];
    }
}
