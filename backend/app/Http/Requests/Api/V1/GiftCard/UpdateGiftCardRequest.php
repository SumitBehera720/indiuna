<?php

namespace App\Http\Requests\Api\V1\GiftCard;

use Illuminate\Foundation\Http\FormRequest;

class UpdateGiftCardRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'amount' => ['sometimes', 'numeric', 'min:0'],
        ];
    }
}
