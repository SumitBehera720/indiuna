<?php
declare(strict_types=1);

namespace App\DTOs\Analytics;

class ReportFilterDTO
{
    public function __construct(
        public readonly ?string $date_from = null,
        public readonly ?string $date_to = null,
        public readonly ?string $group_by = 'day',
        public readonly ?string $type = null,
        public readonly bool $compare_previous = false,
    ) {}

    public static function fromArray(array $data): self
    {
        return new self(
            date_from: $data['date_from'] ?? null,
            date_to: $data['date_to'] ?? null,
            group_by: $data['group_by'] ?? 'day',
            type: $data['type'] ?? null,
            compare_previous: (bool)($data['compare_previous'] ?? false),
        );
    }
}
