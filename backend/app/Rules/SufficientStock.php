<?php
declare(strict_types=1);

namespace App\Rules;

use App\Models\ProductVariant;
use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

class SufficientStock implements ValidationRule
{
    public function __construct(
        private readonly string $variantId,
        private readonly int $quantity,
    ) {}

    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        $variant = ProductVariant::find($this->variantId);

        if (!$variant) {
            $fail('The selected variant does not exist.');
            return;
        }

        $totalAvailable = $variant->inventories->sum(fn($inv) => $inv->available_quantity);

        if ($totalAvailable < $this->quantity) {
            $fail("Insufficient stock for variant {$variant->sku}. Available: {$totalAvailable}, requested: {$this->quantity}.");
        }
    }
}
