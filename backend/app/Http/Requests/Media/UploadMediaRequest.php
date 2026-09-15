<?php

namespace App\Http\Requests\Media;

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
            'file' => ['required', 'file', 'max:10240', 'mimes:jpg,jpeg,png,gif,webp,svg,mp4,pdf,doc,docx'],
            'folder_id' => ['nullable', 'exists:media_folders,id'],
            'mediable_type' => ['nullable', 'string'],
            'mediable_id' => ['nullable', 'string'],
        ];
    }

    public function messages(): array
    {
        return [
            'file.required' => 'Please select a file to upload.',
            'file.file' => 'The uploaded file is invalid.',
            'file.max' => 'File size must not exceed 10MB.',
            'file.mimes' => 'File type is not supported.',
            'folder_id.exists' => 'Media folder not found.',
        ];
    }
}
