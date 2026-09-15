<?php

namespace App\Http\Requests\Api\V1\Newsletter;

use Illuminate\Foundation\Http\FormRequest;

class UpdateCampaignRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'subject' => ['sometimes', 'string'],
            'content' => ['sometimes', 'string'],
        ];
    }
}
