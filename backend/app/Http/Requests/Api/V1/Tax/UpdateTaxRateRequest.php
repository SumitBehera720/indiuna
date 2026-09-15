<?php

namespace App\Http\Requests\Api\V1\Tax;

use Illuminate\Foundation\Http\FormRequest;

class UpdateTaxRateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['sometimes', 'string'],
            'rate' => ['sometimes', 'numeric', 'min:0', 'max:100'],
        ];
    }
}
