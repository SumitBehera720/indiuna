<?php

namespace App\Http\Requests\Api\V1\PurchaseOrder;

use Illuminate\Foundation\Http\FormRequest;

class UpdatePurchaseOrderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'supplier_id' => ['sometimes', 'string'],
            'items' => ['sometimes', 'array'],
        ];
    }
}
