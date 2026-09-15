<?php
declare(strict_types=1);

namespace App\DTOs\Order;

class UpdateOrderStatusDTO
{
    public function __construct(
        public readonly ?string $status = null,
        public readonly ?string $notes = null,
        public readonly bool $notify_customer = false,
    ) {}

    public static function fromArray(array $data): self
    {
        return new self(
            status: $data['status'] ?? null,
            notes: $data['notes'] ?? null,
            notify_customer: (bool)($data['notify_customer'] ?? false),
        );
    }
}
