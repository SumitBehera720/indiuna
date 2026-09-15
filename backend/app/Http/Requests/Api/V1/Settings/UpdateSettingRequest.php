<?php

namespace App\Http\Requests\Api\V1\Settings;

use Illuminate\Foundation\Http\FormRequest;

class UpdateSettingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'group' => ['required', 'string'],
            'values' => ['required', 'array'],
            'values.*' => ['required'],
        ];
    }

    public function messages(): array
    {
        return [
            'group.required' => 'Settings group is required.',
            'values.required' => 'Settings values are required.',
            'values.*.required' => 'Each setting value is required.',
        ];
    }
}
