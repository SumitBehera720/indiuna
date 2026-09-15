<?php

namespace App\Http\Controllers\Api\V1;

use App\DTOs\Customer\CreateCustomerDTO;
use App\DTOs\Customer\CustomerFilterDTO;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Customer\StoreCustomerRequest;
use App\Http\Requests\Api\V1\Customer\UpdateCustomerRequest;
use App\Http\Resources\CustomerResource;
use App\Services\CustomerService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CustomerController extends Controller
{
    public function __construct(
        private readonly CustomerService $customerService,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $filters = CustomerFilterDTO::fromArray($request->all());
        $customers = $this->customerService->getAll($filters);

        return $this->paginated($customers, CustomerResource::class);
    }

    public function show(string $id): JsonResponse
    {
        $customer = $this->customerService->getById($id);

        if (!$customer) {
            return $this->error('Customer not found', 404);
        }

        return $this->success(new CustomerResource($customer));
    }

    public function store(StoreCustomerRequest $request): JsonResponse
    {
        $dto = CreateCustomerDTO::fromArray($request->validated());
        $customer = $this->customerService->create($dto);

        return $this->success(new CustomerResource($customer), 'Customer created successfully', 201);
    }

    public function update(string $id, UpdateCustomerRequest $request): JsonResponse
    {
        $customer = $this->customerService->update($id, $request->validated());

        return $this->success(new CustomerResource($customer), 'Customer updated successfully');
    }

    public function destroy(string $id): JsonResponse
    {
        $this->customerService->delete($id);

        return $this->success(null, 'Customer deleted successfully');
    }

    public function orders(string $id): JsonResponse
    {
        $orders = $this->customerService->getOrders($id);

        return $this->paginated($orders, \App\Http\Resources\OrderResource::class);
    }

    public function activity(string $id): JsonResponse
    {
        $activity = $this->customerService->getActivity($id);

        return $this->success($activity);
    }

    public function addNote(string $id, Request $request): JsonResponse
    {
        $request->validate(['note' => 'required|string']);

        $customer = $this->customerService->addNote($id, $request->input('note'), auth()->id());

        return $this->success(new CustomerResource($customer), 'Note added successfully');
    }

    public function profile(Request $request): JsonResponse
    {
        $user = $request->user();
        $customer = $user->customer;

        if (!$customer) {
            $customer = \App\Models\Customer::where('email', $user->email)->first();

            if ($customer) {
                $customer->update(['user_id' => $user->id]);
            } else {
                $customer = \App\Models\Customer::create([
                    'user_id' => $user->id,
                    'first_name' => $user->first_name ?? 'Customer',
                    'last_name' => $user->last_name ?? '',
                    'email' => $user->email,
                    'phone' => $user->phone ?? null,
                ]);
            }
        }

        return $this->success(new CustomerResource($customer));
    }

    public function updateProfile(Request $request): JsonResponse
    {
        $user = $request->user();
        $customer = $user->customer;

        if (!$customer) {
            $customer = \App\Models\Customer::where('email', $user->email)->first();

            if ($customer) {
                $customer->update(['user_id' => $user->id]);
            } else {
                $customer = \App\Models\Customer::create([
                    'user_id' => $user->id,
                    'first_name' => $user->first_name ?? 'Customer',
                    'last_name' => $user->last_name ?? '',
                    'email' => $user->email,
                    'phone' => $user->phone ?? null,
                ]);
            }
        }

        $request->validate([
            'first_name' => 'string|max:255',
            'last_name' => 'string|max:255',
            'phone' => 'string|max:20',
            'date_of_birth' => 'nullable|date',
            'gender' => 'nullable|string|in:male,female,other',
        ]);

        $customer = $this->customerService->update($customer->id, $request->only([
            'first_name', 'last_name', 'phone', 'date_of_birth', 'gender',
        ]));

        return $this->success(new CustomerResource($customer), 'Profile updated successfully');
    }

    public function wishlist(Request $request): JsonResponse
    {
        $customer = $request->user()->customer;

        if (!$customer) {
            return $this->error('Customer profile not found', 404);
        }

        $wishlist = $this->customerService->getWishlist($customer->id);

        return $this->success(\App\Http\Resources\ProductResource::collection($wishlist));
    }

    public function addToWishlist(Request $request): JsonResponse
    {
        $request->validate(['product_id' => 'required|string']);

        $customer = $request->user()->customer;

        if (!$customer) {
            return $this->error('Customer profile not found', 404);
        }

        $this->customerService->addToWishlist($customer->id, $request->input('product_id'));

        return $this->success(null, 'Product added to wishlist');
    }

    public function removeFromWishlist(string $productId, Request $request): JsonResponse
    {
        $customer = $request->user()->customer;

        if (!$customer) {
            return $this->error('Customer profile not found', 404);
        }

        $this->customerService->removeFromWishlist($customer->id, $productId);

        return $this->success(null, 'Product removed from wishlist');
    }
}
