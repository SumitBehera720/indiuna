<?php

namespace App\Http\Requests\Api\V1\Cart;

use Illuminate\Foundation\Http\FormRequest;

class AddItemRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'product_id' => ['required', 'string'],
            'variant_id' => ['required', 'string'],
            'quantity' => ['required', 'integer', 'min:1'],
        ];
    }
}
