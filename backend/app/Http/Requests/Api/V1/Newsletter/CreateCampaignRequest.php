<?php

namespace App\Http\Requests\Api\V1\Newsletter;

use Illuminate\Foundation\Http\FormRequest;

class CreateCampaignRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'subject' => ['required', 'string'],
            'content' => ['required', 'string'],
        ];
    }
}
