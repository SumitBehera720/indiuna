<?php

namespace App\Http\Requests\Api\V1\GiftCard;

use Illuminate\Foundation\Http\FormRequest;

class StoreGiftCardRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'amount' => ['required', 'numeric', 'min:0'],
        ];
    }
}
