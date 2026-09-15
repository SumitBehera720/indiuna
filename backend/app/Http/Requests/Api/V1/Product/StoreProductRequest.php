<?php

namespace App\Http\Requests\Api\V1\Product;

use Illuminate\Foundation\Http\FormRequest;

class StoreProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:500'],
            'slug' => ['nullable', 'string', 'max:500', 'unique:products,slug'],
            'brand_id' => ['nullable', 'exists:brands,id'],
            'short_description' => ['nullable', 'string', 'max:1000'],
            'description' => ['nullable', 'string'],
            'status' => ['required', 'in:draft,published,scheduled,archived'],
            'gender' => ['nullable', 'string', 'in:men,women,unisex'],
            'is_featured' => ['boolean'],
            'seo_title' => ['nullable', 'string', 'max:70'],
            'seo_description' => ['nullable', 'string', 'max:160'],
            'categories' => ['nullable', 'array'],
            'categories.*' => ['exists:categories,id'],
            'collections' => ['nullable', 'array'],
            'collections.*' => ['exists:collections,id'],
            'tags' => ['nullable', 'array'],
            'tags.*' => ['string', 'max:100'],
            'variants' => ['required', 'array', 'min:1'],
            'variants.*.sku' => ['required', 'string', 'max:100', 'unique:product_variants,sku'],
            'variants.*.price' => ['required', 'numeric', 'min:0'],
            'variants.*.compare_price' => ['nullable', 'numeric', 'min:0'],
            'variants.*.cost_price' => ['nullable', 'numeric', 'min:0'],
            'variants.*.stock' => ['integer', 'min:0'],
            'variants.*.weight' => ['nullable', 'numeric', 'min:0'],
            'variants.*.is_active' => ['boolean'],
            'variants.*.attributes' => ['nullable', 'array'],
            'images' => ['nullable', 'array'],
            'images.*.url' => ['required_with:images', 'string', 'max:500'],
            'images.*.is_primary' => ['boolean'],
            'images.*.alt_text' => ['nullable', 'string', 'max:255'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Product name is required.',
            'variants.required' => 'At least one variant is required.',
            'variants.min' => 'At least one variant is required.',
            'variants.*.sku.required' => 'SKU is required for each variant.',
            'variants.*.sku.unique' => 'This SKU is already in use.',
            'variants.*.price.required' => 'Price is required for each variant.',
        ];
    }
}
