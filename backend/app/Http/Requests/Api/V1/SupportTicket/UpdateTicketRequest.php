<?php

namespace App\Http\Requests\Api\V1\SupportTicket;

use Illuminate\Foundation\Http\FormRequest;

class UpdateTicketRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'subject' => ['sometimes', 'string'],
            'message' => ['sometimes', 'string'],
        ];
    }
}
