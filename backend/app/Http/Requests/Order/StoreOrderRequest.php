<?php

namespace App\Http\Requests\Order;

use Illuminate\Foundation\Http\FormRequest;

class StoreOrderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'cart_id' => ['required', 'string', 'exists:carts,id'],
            'shipping_address_id' => ['required', 'string'],
            'billing_address_id' => ['required', 'string'],
            'coupon_code' => ['nullable', 'string', 'exists:coupons,code'],
            'notes' => ['nullable', 'string'],
            'is_gift' => ['boolean'],
            'gift_message' => ['nullable', 'string'],
        ];
    }

    public function messages(): array
    {
        return [
            'cart_id.required' => 'Cart is required.',
            'cart_id.exists' => 'Cart not found.',
            'shipping_address_id.required' => 'Shipping address is required.',
            'billing_address_id.required' => 'Billing address is required.',
            'coupon_code.exists' => 'Coupon code is invalid.',
        ];
    }
}
