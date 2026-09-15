<?php

namespace App\Http\Requests\Api\V1\Tax;

use Illuminate\Foundation\Http\FormRequest;

class StoreTaxRateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string'],
            'rate' => ['required', 'numeric', 'min:0', 'max:100'],
        ];
    }
}
