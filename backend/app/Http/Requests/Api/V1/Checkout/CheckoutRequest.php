<?php

namespace App\Http\Requests\Api\V1\Checkout;

use Illuminate\Foundation\Http\FormRequest;

class CheckoutRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'address_id' => ['required', 'string'],
            'shipping_method_id' => ['required', 'string'],
            'payment_method_id' => ['required', 'string'],
            'notes' => ['nullable', 'string'],
        ];
    }
}
