<?php

namespace App\Http\Requests\Api\V1\PurchaseOrder;

use Illuminate\Foundation\Http\FormRequest;

class StorePurchaseOrderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'supplier_id' => ['required', 'string'],
            'items' => ['required', 'array'],
        ];
    }
}
