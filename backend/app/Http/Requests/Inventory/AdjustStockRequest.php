<?php

namespace App\Http\Requests\Inventory;

use Illuminate\Foundation\Http\FormRequest;

class AdjustStockRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'variant_id' => ['required', 'exists:product_variants,id'],
            'warehouse_id' => ['required', 'exists:warehouses,id'],
            'quantity' => ['required', 'integer'],
            'type' => ['required', 'in:addition,reduction,adjustment,return'],
            'notes' => ['nullable', 'string'],
            'reference_type' => ['nullable', 'string'],
            'reference_id' => ['nullable', 'string'],
        ];
    }

    public function messages(): array
    {
        return [
            'variant_id.required' => 'Product variant is required.',
            'variant_id.exists' => 'Product variant not found.',
            'warehouse_id.required' => 'Warehouse is required.',
            'warehouse_id.exists' => 'Warehouse not found.',
            'quantity.required' => 'Quantity is required.',
            'type.required' => 'Adjustment type is required.',
            'type.in' => 'Invalid adjustment type.',
        ];
    }
}
