<?php
declare(strict_types=1);

namespace App\Rules;

use App\Enums\OrderStatus;
use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

class ValidOrderStatusTransition implements ValidationRule
{
    public function __construct(
        private readonly ?string $currentStatus,
    ) {}

    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        $requestedStatus = OrderStatus::tryFrom($value);

        if ($requestedStatus === null) {
            $fail('The :attribute must be a valid order status.');
            return;
        }

        if ($this->currentStatus === null) {
            return;
        }

        $current = OrderStatus::tryFrom($this->currentStatus);

        if ($current === null) {
            return;
        }

        $allowed = OrderStatus::allowedTransitions()[$current->value] ?? [];

        if (!in_array($requestedStatus, $allowed)) {
            $fail("Cannot transition from {$current->label()} to {$requestedStatus->label()}.");
        }
    }
}
