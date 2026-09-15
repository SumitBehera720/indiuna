<?php
declare(strict_types=1);

namespace App\Contracts\Repositories;

use Illuminate\Database\Eloquent\Collection;

interface SettingRepositoryInterface extends RepositoryInterface
{
    public function getByGroup(string $group): Collection;

    public function getValue(string $key, mixed $default = null): mixed;

    public function setValue(string $key, mixed $value): void;

    public function setGroupValues(string $group, array $values): void;
}
