<?php
declare(strict_types=1);

namespace App\DTOs\Order;

class UpdateOrderStatusDTO
{
    public function __construct(
        public readonly ?string $status = null,
        public readonly ?string $notes = null,
        public readonly bool $notify_customer = false,
        public readonly ?string $tracking_number = null,
        public readonly ?string $courier_name = null,
    ) {}

    public static function fromArray(array $data): self
    {
        return new self(
            status: $data['status'] ?? null,
            notes: $data['notes'] ?? null,
            notify_customer: (bool)($data['notify_customer'] ?? false),
            tracking_number: $data['tracking_number'] ?? null,
            courier_name: $data['courier_name'] ?? null,
        );
    }
}
