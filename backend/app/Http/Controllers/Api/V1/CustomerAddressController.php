<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Customer\StoreAddressRequest;
use App\Http\Requests\Api\V1\Customer\UpdateAddressRequest;
use App\Http\Resources\CustomerAddressResource;
use App\Models\Customer;
use App\Models\CustomerAddress;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CustomerAddressController extends Controller
{
    private function authorizeOwnership(Request $request, string $customerId): Customer
    {
        $customer = Customer::findOrFail($customerId);

        $user = $request->user();

        if (!$user || $customer->user_id !== $user->id) {
            abort(403, 'Unauthorized action.');
        }

        return $customer;
    }

    public function index(Request $request, string $customerId): JsonResponse
    {
        $this->authorizeOwnership($request, $customerId);

        $addresses = CustomerAddress::where('customer_id', $customerId)->get();

        return $this->success(CustomerAddressResource::collection($addresses));
    }

    public function show(Request $request, string $customerId, string $id): JsonResponse
    {
        $this->authorizeOwnership($request, $customerId);

        $address = CustomerAddress::where('customer_id', $customerId)->findOrFail($id);

        return $this->success(new CustomerAddressResource($address));
    }

    public function store(Request $request, string $customerId, StoreAddressRequest $addressRequest): JsonResponse
    {
        $this->authorizeOwnership($request, $customerId);

        $data = $addressRequest->validated();

        if (empty($data['postal_code']) && !empty($data['pincode'])) {
            $data['postal_code'] = $data['pincode'];
        }
        unset($data['pincode']);

        if (empty($data['first_name'])) {
            $user = $request->user();
            $nameParts = explode(' ', trim($user->name ?? 'Customer'), 2);
            $data['first_name'] = $nameParts[0] ?? 'Customer';
            if (empty($data['last_name']) && isset($nameParts[1])) {
                $data['last_name'] = $nameParts[1];
            }
        }

        if (empty($data['country'])) {
            $data['country'] = 'India';
        }

        $address = CustomerAddress::create(array_merge(
            $data,
            ['customer_id' => $customerId]
        ));

        if ($address->is_default) {
            CustomerAddress::where('customer_id', $customerId)
                ->where('id', '!=', $address->id)
                ->update(['is_default' => false]);
        }

        return $this->success(new CustomerAddressResource($address), 'Address created successfully', 201);
    }

    public function update(Request $request, string $customerId, string $id, UpdateAddressRequest $addressRequest): JsonResponse
    {
        $this->authorizeOwnership($request, $customerId);

        $address = CustomerAddress::where('customer_id', $customerId)->findOrFail($id);
        $data = $addressRequest->validated();

        if (empty($data['postal_code']) && !empty($data['pincode'])) {
            $data['postal_code'] = $data['pincode'];
        }
        unset($data['pincode']);

        $address->update($data);

        if ($address->is_default) {
            CustomerAddress::where('customer_id', $customerId)
                ->where('id', '!=', $address->id)
                ->update(['is_default' => false]);
        }

        return $this->success(new CustomerAddressResource($address->fresh()), 'Address updated successfully');
    }

    public function destroy(Request $request, string $customerId, string $id): JsonResponse
    {
        $this->authorizeOwnership($request, $customerId);

        $address = CustomerAddress::where('customer_id', $customerId)->findOrFail($id);
        $address->delete();

        return $this->success(null, 'Address deleted successfully');
    }
}
