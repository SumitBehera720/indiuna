<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\PaymentMethod\StorePaymentMethodRequest;
use App\Http\Requests\Api\V1\PaymentMethod\UpdatePaymentMethodRequest;
use App\Http\Resources\PaymentMethodResource;
use App\Models\PaymentMethod;
use Illuminate\Http\JsonResponse;

class PaymentMethodController extends Controller
{
    public function __construct(
        private readonly PaymentMethod $paymentMethod,
    ) {}

    public function index(): JsonResponse
    {
        $methods = $this->paymentMethod->paginate(15);

        return $this->paginated($methods, PaymentMethodResource::class);
    }

    public function show(string $id): JsonResponse
    {
        $method = $this->paymentMethod->findOrFail($id);

        return $this->success(new PaymentMethodResource($method));
    }

    public function store(StorePaymentMethodRequest $request): JsonResponse
    {
        $method = $this->paymentMethod->create($request->validated());

        return $this->success(new PaymentMethodResource($method), 'Payment method created successfully', 201);
    }

    public function update(string $id, UpdatePaymentMethodRequest $request): JsonResponse
    {
        $method = $this->paymentMethod->findOrFail($id);
        $method->update($request->validated());

        return $this->success(new PaymentMethodResource($method->fresh()), 'Payment method updated successfully');
    }

    public function destroy(string $id): JsonResponse
    {
        $method = $this->paymentMethod->findOrFail($id);
        $method->delete();

        return $this->success(null, 'Payment method deleted successfully');
    }
}
