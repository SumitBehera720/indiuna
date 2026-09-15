<?php
declare(strict_types=1);

namespace App\DTOs\Order;

class OrderFilterDTO
{
    public function __construct(
        public readonly ?string $status = null,
        public readonly ?string $payment_status = null,
        public readonly ?string $shipping_status = null,
        public readonly ?string $customer_id = null,
        public readonly ?string $date_from = null,
        public readonly ?string $date_to = null,
        public readonly ?string $search = null,
        public readonly ?string $sort_by = 'created_at',
        public readonly ?string $sort_order = 'desc',
        public readonly ?int $per_page = 15,
    ) {}

    public static function fromArray(array $data): self
    {
        return new self(
            status: $data['status'] ?? null,
            payment_status: $data['payment_status'] ?? null,
            shipping_status: $data['shipping_status'] ?? null,
            customer_id: $data['customer_id'] ?? null,
            date_from: $data['date_from'] ?? null,
            date_to: $data['date_to'] ?? null,
            search: $data['search'] ?? null,
            sort_by: $data['sort_by'] ?? 'created_at',
            sort_order: $data['sort_order'] ?? 'desc',
            per_page: isset($data['per_page']) ? (int)$data['per_page'] : 15,
        );
    }
}
