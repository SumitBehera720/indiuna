<?php

namespace App\Http\Requests\Api\V1\Product;

use Illuminate\Foundation\Http\FormRequest;

class StoreVariantRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'sku' => ['required', 'string', 'unique:product_variants,sku'],
            'attributes' => ['required', 'array'],
            'price' => ['required', 'numeric', 'min:0'],
        ];
    }
}
