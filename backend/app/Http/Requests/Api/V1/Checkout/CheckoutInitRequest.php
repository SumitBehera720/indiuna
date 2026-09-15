<?php

namespace App\Http\Requests\Api\V1\Checkout;

use Illuminate\Foundation\Http\FormRequest;

class CheckoutInitRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'items' => ['required', 'array', 'min:1', 'max:50'],
            'items.*.product_id' => ['required', 'string'],
            'items.*.variant_id' => ['required', 'string'],
            'items.*.quantity' => ['required', 'integer', 'min:1', 'max:99'],
            'items.*.meta_data' => ['nullable', 'array'],

            'shipping_address' => ['required', 'array'],
            'shipping_address.first_name' => ['required', 'string', 'max:100'],
            'shipping_address.last_name' => ['nullable', 'string', 'max:100'],
            'shipping_address.phone' => ['required', 'string', 'max:20'],
            'shipping_address.email' => ['required', 'email', 'max:255'],
            'shipping_address.address_line1' => ['required', 'string', 'max:500'],
            'shipping_address.address_line2' => ['nullable', 'string', 'max:500'],
            'shipping_address.city' => ['required', 'string', 'max:100'],
            'shipping_address.state' => ['required', 'string', 'max:100'],
            'shipping_address.postal_code' => ['required', 'string', 'max:20'],
            'shipping_address.country' => ['nullable', 'string', 'max:100'],

            'billing_same_as_shipping' => ['nullable', 'boolean'],
            'billing_address' => ['nullable', 'array'],
            'billing_address.first_name' => ['nullable', 'string', 'max:100'],
            'billing_address.last_name' => ['nullable', 'string', 'max:100'],
            'billing_address.phone' => ['nullable', 'string', 'max:20'],
            'billing_address.email' => ['nullable', 'email', 'max:255'],
            'billing_address.address_line1' => ['nullable', 'string', 'max:500'],
            'billing_address.address_line2' => ['nullable', 'string', 'max:500'],
            'billing_address.city' => ['nullable', 'string', 'max:100'],
            'billing_address.state' => ['nullable', 'string', 'max:100'],
            'billing_address.postal_code' => ['nullable', 'string', 'max:20'],
            'billing_address.country' => ['nullable', 'string', 'max:100'],

            'payment_method' => ['required', 'in:razorpay,cod'],
            'shipping_method_code' => ['nullable', 'string', 'max:100'],
            'coupon_code' => ['nullable', 'string', 'max:50'],
            'notes' => ['nullable', 'string', 'max:2000'],
            'is_gift' => ['nullable', 'boolean'],
            'gift_message' => ['nullable', 'string', 'max:500'],
        ];
    }
}
