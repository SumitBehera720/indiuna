<?php
declare(strict_types=1);

namespace App\Contracts\Repositories;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;
use App\DTOs\Order\OrderFilterDTO;

interface OrderRepositoryInterface extends RepositoryInterface
{
    public function findByNumber(string $number): ?Model;

    public function getByCustomer(string $customerId): Collection;

    public function getByStatus(string $status): Collection;

    public function getFiltered(OrderFilterDTO $filters): LengthAwarePaginator;

    public function getTimeline(string $orderId): Collection;

    public function getRevenueBetween(string $from, string $to): float;

    public function findWithRelations(string $id): ?Model;
}
