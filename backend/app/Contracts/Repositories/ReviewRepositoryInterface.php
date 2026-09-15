<?php
declare(strict_types=1);

namespace App\Contracts\Repositories;

use Illuminate\Database\Eloquent\Collection;

interface ReviewRepositoryInterface extends RepositoryInterface
{
    public function getByProduct(string $productId): Collection;

    public function getPending(): Collection;

    public function getApproved(): Collection;

    public function getAverageRating(string $productId): float;
}
