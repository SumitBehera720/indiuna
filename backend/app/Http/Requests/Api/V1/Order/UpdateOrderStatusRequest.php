<?php

namespace App\Http\Requests\Api\V1\Order;

use Illuminate\Foundation\Http\FormRequest;

class UpdateOrderStatusRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'status' => ['required', 'in:pending,confirmed,processing,shipped,delivered,cancelled,returned,refunded'],
            'notes' => ['nullable', 'string'],
            'notify_customer' => ['boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'status.required' => 'Order status is required.',
            'status.in' => 'The selected status is invalid.',
        ];
    }
}
