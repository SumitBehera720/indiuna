<?php

namespace App\Http\Requests\Api\V1\Shipping;

use Illuminate\Foundation\Http\FormRequest;

class StoreShippingMethodRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255', 'unique:shipping_methods,slug'],
            'carrier' => ['nullable', 'string', 'max:255'],
            'estimated_days_min' => ['nullable', 'integer'],
            'estimated_days_max' => ['nullable', 'integer'],
            'is_free' => ['boolean'],
            'is_active' => ['boolean'],
            'sort_order' => ['integer'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Shipping method name is required.',
        ];
    }
}
