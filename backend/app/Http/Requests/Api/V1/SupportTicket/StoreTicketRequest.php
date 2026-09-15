<?php

namespace App\Http\Requests\Api\V1\SupportTicket;

use Illuminate\Foundation\Http\FormRequest;

class StoreTicketRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'subject' => ['required', 'string'],
            'message' => ['required', 'string'],
        ];
    }
}
