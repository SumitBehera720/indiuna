<?php
declare(strict_types=1);

namespace App\DTOs\Customer;

class CreateCustomerDTO
{
    public function __construct(
        public readonly string $first_name,
        public readonly string $last_name,
        public readonly string $email,
        public readonly ?string $phone = null,
        public readonly ?string $password = null,
        public readonly ?string $date_of_birth = null,
        public readonly ?string $gender = null,
        public readonly ?string $notes = null,
    ) {}

    public static function fromArray(array $data): self
    {
        return new self(
            first_name: $data['first_name'],
            last_name: $data['last_name'],
            email: $data['email'],
            phone: $data['phone'] ?? null,
            password: $data['password'] ?? null,
            date_of_birth: $data['date_of_birth'] ?? null,
            gender: $data['gender'] ?? null,
            notes: $data['notes'] ?? null,
        );
    }
}
