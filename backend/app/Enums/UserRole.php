<?php

namespace App\Enums;

enum UserRole: string
{
    case SuperAdmin = 'super_admin';
    case Admin = 'admin';
    case Manager = 'manager';
    case Warehouse = 'warehouse';
    case Support = 'support';
    case Finance = 'finance';

    public function label(): string
    {
        return match ($this) {
            self::SuperAdmin => 'Super Admin',
            self::Admin => 'Admin',
            self::Manager => 'Manager',
            self::Warehouse => 'Warehouse',
            self::Support => 'Support',
            self::Finance => 'Finance',
        };
    }

    public function isAdmin(): bool
    {
        return in_array($this, [self::SuperAdmin, self::Admin]);
    }

    public static function all(): array
    {
        return array_column(self::cases(), 'value');
    }
}
