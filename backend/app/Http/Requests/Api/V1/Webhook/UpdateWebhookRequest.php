<?php

namespace App\Http\Requests\Api\V1\Webhook;

use Illuminate\Foundation\Http\FormRequest;

class UpdateWebhookRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'url' => ['sometimes', 'url'],
            'events' => ['sometimes', 'array'],
        ];
    }
}
