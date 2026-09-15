<?php
declare(strict_types=1);

namespace App\Contracts\Repositories;

use Illuminate\Database\Eloquent\Collection;

interface MediaRepositoryInterface extends RepositoryInterface
{
    public function getByFolder(?string $folderId): Collection;

    public function getByMediable(string $type, string $id): Collection;

    public function search(string $query): Collection;
}
