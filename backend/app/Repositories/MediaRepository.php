<?php
declare(strict_types=1);

namespace App\Repositories;

use App\Contracts\Repositories\MediaRepositoryInterface;
use App\Models\Media;
use Illuminate\Database\Eloquent\Collection;

class MediaRepository extends BaseRepository implements MediaRepositoryInterface
{
    public function __construct()
    {
        parent::__construct(new Media());
    }

    public function getByFolder(?string $folderId): Collection
    {
        if ($folderId === null) {
            return $this->model->whereNull('folder_id')->get();
        }

        return $this->model->where('folder_id', $folderId)->get();
    }

    public function getByMediable(string $type, string $id): Collection
    {
        return $this->model->where('mediable_type', $type)
            ->where('mediable_id', $id)
            ->get();
    }

    public function search(string $query): Collection
    {
        return $this->model->where('name', 'LIKE', "%{$query}%")->get();
    }
}
