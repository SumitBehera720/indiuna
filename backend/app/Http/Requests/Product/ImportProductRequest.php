<?php

namespace App\Http\Requests\Product;

use Illuminate\Foundation\Http\FormRequest;

class ImportProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'file' => ['required', 'file', 'mimes:csv,xlsx,xls', 'max:10240'],
        ];
    }

    public function messages(): array
    {
        return [
            'file.required' => 'Please upload a file.',
            'file.file' => 'The uploaded file is invalid.',
            'file.mimes' => 'Only CSV, XLSX, and XLS files are allowed.',
            'file.max' => 'File size must not exceed 10MB.',
        ];
    }
}
