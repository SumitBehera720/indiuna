<?php

namespace App\Http\Requests\Api\V1\Category;

use Illuminate\Foundation\Http\FormRequest;

class UpdateCategoryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $categoryParam = $this->route('category');
        $categoryId = $categoryParam instanceof \Illuminate\Database\Eloquent\Model ? $categoryParam->getKey() : $categoryParam;

        return [
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'slug' => ['sometimes', 'nullable', 'string', 'max:255', 'unique:categories,slug,' . $categoryId],
            'parent_id' => ['sometimes', 'nullable', 'exists:categories,id'],
            'description' => ['sometimes', 'nullable', 'string'],
            'icon' => ['sometimes', 'nullable', 'string'],
            'is_active' => ['sometimes', 'boolean'],
            'is_featured' => ['sometimes', 'boolean'],
            'sort_order' => ['sometimes', 'integer'],
            'image' => ['sometimes', 'nullable', 'string', 'max:500'],
            'banner' => ['sometimes', 'nullable', 'string', 'max:500'],
            'redirect_to' => ['sometimes', 'nullable', 'string', 'max:500'],
            'show_in_pages' => ['sometimes', 'nullable', 'string', 'max:500'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Category name is required.',
        ];
    }
}
