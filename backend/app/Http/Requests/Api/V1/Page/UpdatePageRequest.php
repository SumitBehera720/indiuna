<?php

namespace App\Http\Requests\Api\V1\Page;

use Illuminate\Foundation\Http\FormRequest;

class UpdatePageRequest extends FormRequest
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
