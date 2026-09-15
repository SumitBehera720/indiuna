<?php

namespace App\Http\Requests\Api\V1\Banner;

use Illuminate\Foundation\Http\FormRequest;

class UpdateBannerRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => ['sometimes', 'required', 'string', 'max:255'],
            'subtitle' => ['sometimes', 'nullable', 'string', 'max:255'],
            'description' => ['sometimes', 'nullable', 'string'],
            'image_url' => ['sometimes', 'nullable', 'string', 'max:500'],
            'mobile_image_url' => ['sometimes', 'nullable', 'string', 'max:500'],
            'link_url' => ['sometimes', 'nullable', 'string', 'max:500'],
            'link_text' => ['sometimes', 'nullable', 'string', 'max:100'],
            'position' => ['sometimes', 'nullable', 'string', 'max:50'],
            'sort_order' => ['sometimes', 'nullable', 'integer'],
            'is_active' => ['sometimes', 'nullable', 'boolean'],
            'is_new_window' => ['sometimes', 'nullable', 'boolean'],
        ];
    }
}
