<?php
declare(strict_types=1);

namespace App\Contracts\Repositories;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Collection;

interface CouponRepositoryInterface extends RepositoryInterface
{
    public function findByCode(string $code): ?Model;

    public function getValidCoupons(): Collection;

    public function getUsages(string $couponId): Collection;

    public function incrementUsage(string $couponId): void;
}
