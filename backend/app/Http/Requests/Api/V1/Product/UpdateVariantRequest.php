<?php

namespace App\Http\Requests\Api\V1\Product;

use Illuminate\Foundation\Http\FormRequest;

class UpdateVariantRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'sku' => ['sometimes', 'string', 'unique:product_variants,sku'],
            'attributes' => ['sometimes', 'array'],
            'price' => ['sometimes', 'numeric', 'min:0'],
        ];
    }
}
