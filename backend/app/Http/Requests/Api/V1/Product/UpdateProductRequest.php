<?php

namespace App\Http\Requests\Api\V1\Product;

use Illuminate\Foundation\Http\FormRequest;

class UpdateProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $productParam = $this->route('product');
        $productId = $productParam instanceof \Illuminate\Database\Eloquent\Model ? $productParam->getKey() : $productParam;

        return [
            'name' => ['sometimes', 'required', 'string', 'max:500'],
            'slug' => ['sometimes', 'nullable', 'string', 'max:500', 'unique:products,slug,' . $productId],
            'brand_id' => ['sometimes', 'nullable', 'exists:brands,id'],
            'short_description' => ['sometimes', 'nullable', 'string', 'max:1000'],
            'description' => ['sometimes', 'nullable', 'string'],
            'status' => ['sometimes', 'required', 'in:draft,published,scheduled,archived'],
            'gender' => ['sometimes', 'nullable', 'string', 'in:men,women,unisex'],
            'is_featured' => ['sometimes', 'boolean'],
            'seo_title' => ['sometimes', 'nullable', 'string', 'max:70'],
            'seo_description' => ['sometimes', 'nullable', 'string', 'max:160'],
            'categories' => ['sometimes', 'nullable', 'array'],
            'categories.*' => ['exists:categories,id'],
            'collections' => ['sometimes', 'nullable', 'array'],
            'collections.*' => ['exists:collections,id'],
            'tags' => ['sometimes', 'nullable', 'array'],
            'tags.*' => ['string', 'max:100'],
            'variants' => ['sometimes', 'required', 'array', 'min:1'],
            'variants.*.sku' => ['sometimes', 'required', 'string', 'max:100', 'unique:product_variants,sku,' . $productId . ',product_id'],
            'variants.*.price' => ['sometimes', 'required', 'numeric', 'min:0'],
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
            'variants.*.sku.required' => 'SKU is required for each variant.',
            'variants.*.sku.unique' => 'This SKU is already in use.',
            'variants.*.price.required' => 'Price is required for each variant.',
        ];
    }
}
