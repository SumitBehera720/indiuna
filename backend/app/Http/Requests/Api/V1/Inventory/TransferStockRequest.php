<?php

namespace App\Http\Requests\Api\V1\Inventory;

use Illuminate\Foundation\Http\FormRequest;

class TransferStockRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'variant_id' => ['required', 'string'],
            'from_warehouse_id' => ['required', 'string'],
            'to_warehouse_id' => ['required', 'string'],
            'quantity' => ['required', 'integer', 'min:1'],
        ];
    }
}
