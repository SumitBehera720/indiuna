<?php

namespace App\Enums;

enum ProductStatus: string
{
    case Draft = 'draft';
    case Published = 'published';
    case Scheduled = 'scheduled';
    case Archived = 'archived';

    public function label(): string
    {
        return match ($this) {
            self::Draft => 'Draft',
            self::Published => 'Published',
            self::Scheduled => 'Scheduled',
            self::Archived => 'Archived',
        };
    }

    public function isVisible(): bool
    {
        return $this === self::Published;
    }

    public function isEditable(): bool
    {
        return $this !== self::Archived;
    }
}
