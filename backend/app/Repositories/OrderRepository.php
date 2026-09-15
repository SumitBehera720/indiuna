<?php
declare(strict_types=1);

namespace App\Repositories;

use App\Contracts\Repositories\OrderRepositoryInterface;
use App\DTOs\Order\OrderFilterDTO;
use App\Models\Order;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

class OrderRepository extends BaseRepository implements OrderRepositoryInterface
{
    public function __construct()
    {
        parent::__construct(new Order());
    }

    public function findByNumber(string $number): ?Model
    {
        return $this->model->where('order_number', $number)->first();
    }

    public function getByCustomer(string $customerId): Collection
    {
        return $this->model->where('customer_id', $customerId)->get();
    }

    public function getByStatus(string $status): Collection
    {
        return $this->model->where('status', $status)->get();
    }

    public function getFiltered(OrderFilterDTO $filters): LengthAwarePaginator
    {
        $query = $this->model->newQuery();

        if ($filters->status) {
            $query->where('status', $filters->status);
        }

        if ($filters->payment_status) {
            $query->where('payment_status', $filters->payment_status);
        }

        if ($filters->shipping_status) {
            $query->where('shipping_status', $filters->shipping_status);
        }

        if ($filters->customer_id) {
            $query->where('customer_id', $filters->customer_id);
        }

        if ($filters->date_from) {
            $query->whereDate('created_at', '>=', $filters->date_from);
        }

        if ($filters->date_to) {
            $query->whereDate('created_at', '<=', $filters->date_to);
        }

        if ($filters->search) {
            $query->where(function ($q) use ($filters) {
                $q->where('order_number', 'LIKE', "%{$filters->search}%")
                    ->orWhere('billing_first_name', 'LIKE', "%{$filters->search}%")
                    ->orWhere('billing_email', 'LIKE', "%{$filters->search}%")
                    ->orWhere('shipping_first_name', 'LIKE', "%{$filters->search}%")
                    ->orWhere('shipping_email', 'LIKE', "%{$filters->search}%");
            });
        }

        $sortBy = $filters->sort_by ?: 'created_at';
        $sortOrder = $filters->sort_order ?: 'desc';

        $query->orderBy($sortBy, $sortOrder);

        return $query->paginate($filters->per_page ?: 15);
    }

    public function getTimeline(string $orderId): Collection
    {
        $order = $this->findOrFail($orderId);
        return $order->timeline()->orderBy('created_at')->get();
    }

    public function getRevenueBetween(string $from, string $to): float
    {
        return (float) $this->model->whereBetween('created_at', [$from, $to])->sum('grand_total');
    }

    public function findWithRelations(string $id): ?Model
    {
        return $this->model->with(['items', 'customer', 'payments', 'timeline', 'notes', 'coupon', 'shippingMethod'])
            ->findOrFail($id);
    }
}
