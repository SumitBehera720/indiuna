<?php
declare(strict_types=1);

namespace App\Services;

use App\Contracts\Repositories\SettingRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Cache;

class SettingsService
{
    private const CACHE_KEY = 'app_settings';

    public function __construct(
        private readonly SettingRepositoryInterface $settingRepository,
    ) {}

    public function getAll(): Collection
    {
        return $this->settingRepository->all();
    }

    public function getByGroup(string $group): Collection
    {
        return $this->settingRepository->getByGroup($group);
    }

    public function get(string $key, mixed $default = null): mixed
    {
        return Cache::rememberForever(self::CACHE_KEY . '.' . $key, function () use ($key, $default) {
            return $this->settingRepository->getValue($key, $default);
        });
    }

    public function getBoolean(string $key, bool $default = false): bool
    {
        $value = $this->get($key, $default);

        if (is_bool($value)) {
            return $value;
        }

        if (is_string($value)) {
            return in_array(strtolower(trim($value)), ['1', 'true', 'yes', 'on'], true);
        }

        return (bool) $value;
    }

    public function set(string $key, mixed $value): void
    {
        $this->settingRepository->setValue($key, $value);
        Cache::forget(self::CACHE_KEY . '.' . $key);
    }

    public function setGroup(string $group, array $values): void
    {
        $this->settingRepository->setGroupValues($group, $values);

        foreach ($values as $key => $value) {
            Cache::forget(self::CACHE_KEY . '.' . $group . '.' . $key);
        }
    }
}
