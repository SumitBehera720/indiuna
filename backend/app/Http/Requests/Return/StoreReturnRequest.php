<?php

namespace App\Http\Requests\Return;

use Illuminate\Foundation\Http\FormRequest;

class StoreReturnRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'order_id' => ['required', 'exists:orders,id'],
            'reason' => ['required', 'string'],
            'items' => ['required', 'array'],
            'items.*.order_item_id' => ['required', 'exists:order_items,id'],
            'items.*.quantity' => ['required', 'integer', 'min:1'],
            'items.*.reason' => ['required', 'string'],
        ];
    }

    public function messages(): array
    {
        return [
            'order_id.required' => 'Order is required.',
            'order_id.exists' => 'Order not found.',
            'reason.required' => 'Return reason is required.',
            'items.required' => 'At least one item is required.',
            'items.*.order_item_id.required' => 'Order item is required.',
            'items.*.order_item_id.exists' => 'Order item not found.',
            'items.*.quantity.required' => 'Quantity is required.',
            'items.*.quantity.min' => 'Quantity must be at least 1.',
            'items.*.reason.required' => 'Reason is required for each item.',
        ];
    }
}
