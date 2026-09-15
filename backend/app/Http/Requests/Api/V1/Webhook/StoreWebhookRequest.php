<?php

namespace App\Http\Requests\Api\V1\Webhook;

use Illuminate\Foundation\Http\FormRequest;

class StoreWebhookRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'url' => ['required', 'url'],
            'events' => ['required', 'array'],
        ];
    }
}
