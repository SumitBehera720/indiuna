<?php
declare(strict_types=1);

namespace App\Services;

use App\Contracts\Repositories\CustomerRepositoryInterface;
use App\DTOs\Customer\CreateCustomerDTO;
use App\DTOs\Customer\CustomerFilterDTO;
use App\DTOs\Order\OrderFilterDTO;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class CustomerService
{
    public function __construct(
        private readonly CustomerRepositoryInterface $customerRepository,
        private readonly OrderService $orderService,
    ) {}

    public function getAll(CustomerFilterDTO $filters): LengthAwarePaginator
    {
        return $this->customerRepository->getFiltered($filters);
    }

    public function getById(string $id): ?Model
    {
        return $this->customerRepository->findWithAddresses($id);
    }

    public function create(CreateCustomerDTO $dto): Model
    {
        return DB::transaction(function () use ($dto) {
            $data = [
                'first_name' => $dto->first_name,
                'last_name' => $dto->last_name,
                'email' => $dto->email,
                'phone' => $dto->phone,
                'date_of_birth' => $dto->date_of_birth,
                'gender' => $dto->gender,
                'notes' => $dto->notes,
                'is_active' => true,
            ];

            if ($dto->password) {
                $user = User::create([
                    'name' => $dto->first_name . ' ' . $dto->last_name,
                    'email' => $dto->email,
                    'password' => Hash::make($dto->password),
                ]);
                $data['user_id'] = $user->id;
            }

            return $this->customerRepository->create($data);
        });
    }

    public function update(string $id, array $data): Model
    {
        $customer = $this->customerRepository->findOrFail($id);
        return $this->customerRepository->update($customer, $data);
    }

    public function delete(string $id): bool
    {
        $customer = $this->customerRepository->findOrFail($id);
        return $this->customerRepository->delete($customer);
    }

    public function getOrders(string $id): LengthAwarePaginator
    {
        $filters = OrderFilterDTO::fromArray([
            'customer_id' => $id,
            'sort_by' => 'created_at',
            'sort_order' => 'desc',
            'per_page' => 15,
        ]);

        return $this->orderService->getAll($filters);
    }

    public function getActivity(string $id): Collection
    {
        return activity()
            ->causedBy($id)
            ->withProperties(['customer_id' => $id])
            ->get();
    }

    public function addNote(string $id, string $note, string $userId): Model
    {
        $customer = $this->customerRepository->findOrFail($id);

        $customer->staffNotes()->create([
            'note' => $note,
            'user_id' => $userId,
        ]);

        return $customer->fresh()->load('staffNotes');
    }

    public function getWishlist(string $id): Collection
    {
        $customer = $this->customerRepository->findOrFail($id);
        return $customer->wishlistProducts;
    }

    public function addToWishlist(string $customerId, string $productId): Model
    {
        $customer = $this->customerRepository->findOrFail($customerId);

        if (!$customer->wishlistProducts()->where('product_id', $productId)->exists()) {
            $customer->wishlistProducts()->attach($productId);
        }

        return $customer->fresh()->load('wishlistProducts');
    }

    public function removeFromWishlist(string $customerId, string $productId): Model
    {
        $customer = $this->customerRepository->findOrFail($customerId);
        $customer->wishlistProducts()->detach($productId);
        return $customer->fresh()->load('wishlistProducts');
    }
}
