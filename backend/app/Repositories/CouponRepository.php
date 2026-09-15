<?php
declare(strict_types=1);

namespace App\Repositories;

use App\Contracts\Repositories\CouponRepositoryInterface;
use App\Models\Coupon;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Collection;

class CouponRepository extends BaseRepository implements CouponRepositoryInterface
{
    public function __construct()
    {
        parent::__construct(new Coupon());
    }

    public function findByCode(string $code): ?Model
    {
        return $this->model->where('code', $code)->first();
    }

    public function getValidCoupons(): Collection
    {
        return $this->model->where('is_active', true)
            ->where('starts_at', '<=', now())
            ->where(function ($q) {
                $q->where('expires_at', '>=', now())
                    ->orWhereNull('expires_at');
            })
            ->get();
    }

    public function getUsages(string $couponId): Collection
    {
        $coupon = $this->findOrFail($couponId);
        return $coupon->couponUsages()->with(['customer', 'order'])->get();
    }

    public function incrementUsage(string $couponId): void
    {
        $this->model->where('id', $couponId)->increment('total_used');
    }
}
