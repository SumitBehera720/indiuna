<?php
declare(strict_types=1);

namespace App\Repositories;

use App\Contracts\Repositories\SettingRepositoryInterface;
use App\Models\Setting;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Cache;

class SettingRepository extends BaseRepository implements SettingRepositoryInterface
{
    public function __construct()
    {
        parent::__construct(new Setting());
    }

    public function getByGroup(string $group): Collection
    {
        return Cache::remember("settings.{$group}", 3600, function () use ($group) {
            return $this->model->where('group', $group)->get();
        });
    }

    public function getValue(string $key, mixed $default = null): mixed
    {
        $setting = $this->model->where('key', $key)->first();

        if (!$setting) {
            return $default;
        }

        return $setting->value;
    }

    public function setValue(string $key, mixed $value): void
    {
        $setting = $this->model->updateOrCreate(
            ['key' => $key],
            ['value' => $value]
        );

        if ($setting->group) {
            Cache::forget("settings.{$setting->group}");
        }
    }

    public function setGroupValues(string $group, array $values): void
    {
        foreach ($values as $key => $value) {
            $this->model->updateOrCreate(
                ['key' => $key, 'group' => $group],
                ['value' => $value]
            );
        }

        Cache::forget("settings.{$group}");
    }
}
