<?php

namespace App\Http\Requests\Api\V1\Checkout;

use Illuminate\Foundation\Http\FormRequest;

class CheckoutVerifyRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'order_id' => ['required', 'string'],
            'razorpay_order_id' => ['required', 'string', 'starts_with:order_'],
            'razorpay_payment_id' => ['required', 'string', 'starts_with:pay_'],
            'razorpay_signature' => ['required', 'string'],
        ];
    }
}
