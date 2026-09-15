<?php

namespace App\Http\Requests\Api\V1\Media;

use Illuminate\Foundation\Http\FormRequest;

class UploadMediaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'file' => ['required_without:image', 'nullable', 'file', 'max:512000'],
            'image' => ['required_without:file', 'nullable', 'file', 'max:512000'],
            'folder_id' => ['nullable', 'string'],
            'mediable_type' => ['nullable', 'string'],
            'mediable_id' => ['nullable', 'string'],
        ];
    }

    public function messages(): array
    {
        return [
            'file.required_without' => 'Please select a file to upload.',
            'image.required_without' => 'Please select an image to upload.',
            'file.file' => 'The uploaded file is invalid.',
            'image.file' => 'The uploaded image is invalid.',
            'file.max' => 'File size must not exceed 500MB.',
            'image.max' => 'Image size must not exceed 500MB.',
        ];
    }
}
