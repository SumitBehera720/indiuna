<?php

namespace App\Http\Requests\Product;

use Illuminate\Foundation\Http\FormRequest;

class BulkProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'ids' => ['required', 'array'],
            'ids.*' => ['required', 'string', 'exists:products,id'],
            'action' => ['required', 'string', 'in:publish,draft,archive,delete'],
            'status' => ['sometimes', 'required', 'in:draft,published,archived'],
        ];
    }

    public function messages(): array
    {
        return [
            'ids.required' => 'Please select at least one product.',
            'ids.*.exists' => 'One or more products do not exist.',
            'action.required' => 'An action is required.',
            'action.in' => 'The selected action is invalid.',
        ];
    }
}
