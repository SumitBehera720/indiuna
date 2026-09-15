<?php
declare(strict_types=1);

namespace App\Repositories;

use App\Contracts\Repositories\ReviewRepositoryInterface;
use App\Models\Review;
use Illuminate\Database\Eloquent\Collection;

class ReviewRepository extends BaseRepository implements ReviewRepositoryInterface
{
    public function __construct()
    {
        parent::__construct(new Review());
    }

    public function getByProduct(string $productId): Collection
    {
        return $this->model->where('product_id', $productId)
            ->with('customer')
            ->get();
    }

    public function getPending(): Collection
    {
        return $this->model->where('is_approved', false)->get();
    }

    public function getApproved(): Collection
    {
        return $this->model->where('is_approved', true)->get();
    }

    public function getAverageRating(string $productId): float
    {
        return (float) $this->model->where('product_id', $productId)
            ->where('is_approved', true)
            ->avg('rating');
    }
}
