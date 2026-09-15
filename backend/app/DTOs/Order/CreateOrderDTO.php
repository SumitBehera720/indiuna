<?php
declare(strict_types=1);

namespace App\DTOs\Order;

class CreateOrderDTO
{
    public function __construct(
        public readonly string $cart_id,
        public readonly string $customer_id,
        public readonly ?string $shipping_address_id = null,
        public readonly ?string $billing_address_id = null,
        public readonly ?string $coupon_code = null,
        public readonly ?string $notes = null,
        public readonly bool $is_gift = false,
        public readonly ?string $gift_message = null,
        public readonly ?string $source = null,
    ) {}

    public static function fromArray(array $data): self
    {
        return new self(
            cart_id: $data['cart_id'],
            customer_id: $data['customer_id'],
            shipping_address_id: $data['shipping_address_id'] ?? null,
            billing_address_id: $data['billing_address_id'] ?? null,
            coupon_code: $data['coupon_code'] ?? null,
            notes: $data['notes'] ?? null,
            is_gift: (bool)($data['is_gift'] ?? false),
            gift_message: $data['gift_message'] ?? null,
            source: $data['source'] ?? null,
        );
    }
}
