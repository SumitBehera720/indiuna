<?php

namespace App\Http\Requests\Api\V1\Blog;

use Illuminate\Foundation\Http\FormRequest;

class UpdateBlogRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => ['sometimes', 'string'],
            'content' => ['sometimes', 'string'],
        ];
    }
}
