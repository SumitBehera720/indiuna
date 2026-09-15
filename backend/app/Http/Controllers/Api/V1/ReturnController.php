<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Return\StoreReturnRequest;
use App\Http\Requests\Api\V1\Return\UpdateReturnStatusRequest;
use App\Http\Resources\ReturnResource;
use App\Models\Returns;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReturnController extends Controller
{
    public function __construct(
        private readonly Returns $returnModel,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $query = $this->returnModel->with(['order', 'customer', 'items']);

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        if ($request->filled('order_id')) {
            $query->where('order_id', $request->input('order_id'));
        }

        $returns = $query->paginate(15);

        return $this->paginated($returns, ReturnResource::class);
    }

    public function show(string $id): JsonResponse
    {
        $return = $this->returnModel->with(['order', 'customer', 'items', 'refunds'])->findOrFail($id);

        return $this->success(new ReturnResource($return));
    }

    public function store(StoreReturnRequest $request): JsonResponse
    {
        $customer = $request->user()->customer;

        if (!$customer) {
            return $this->error('Customer profile not found', 404);
        }

        $data = $request->validated();
        $data['customer_id'] = $customer->id;
        $data['status'] = 'pending';
        $data['requested_at'] = now();

        $return = $this->returnModel->create($data);

        if (!empty($data['items'])) {
            foreach ($data['items'] as $item) {
                $return->items()->create($item);
            }
        }

        return $this->success(
            new ReturnResource($return->load('items')),
            'Return request submitted successfully',
            201
        );
    }

    public function updateStatus(string $id, UpdateReturnStatusRequest $request): JsonResponse
    {
        $return = $this->returnModel->findOrFail($id);
        $return->update($request->validated());

        return $this->success(
            new ReturnResource($return->fresh()),
            'Return status updated successfully'
        );
    }

    public function approve(string $id): JsonResponse
    {
        $return = $this->returnModel->findOrFail($id);
        $return->update([
            'status' => 'approved',
            'approved_at' => now(),
        ]);

        return $this->success(new ReturnResource($return->fresh()), 'Return approved successfully');
    }

    public function reject(string $id, Request $request): JsonResponse
    {
        $request->validate(['reason' => 'required|string']);

        $return = $this->returnModel->findOrFail($id);
        $return->update([
            'status' => 'rejected',
            'staff_notes' => $request->input('reason'),
        ]);

        return $this->success(new ReturnResource($return->fresh()), 'Return rejected');
    }

    public function update(string $id, Request $request): JsonResponse
    {
        $return = $this->returnModel->findOrFail($id);
        $return->update($request->all());

        return $this->success(new ReturnResource($return->fresh()), 'Return updated successfully');
    }

    public function destroy(string $id): JsonResponse
    {
        $return = $this->returnModel->findOrFail($id);
        $return->items()->delete();
        $return->delete();

        return $this->success(null, 'Return deleted successfully');
    }

    public function processRefund(string $id, Request $request): JsonResponse
    {
        $request->validate([
            'amount' => 'required|numeric|min:0',
            'payment_method_id' => 'required|string',
        ]);

        $return = $this->returnModel->with('order')->findOrFail($id);

        $refund = $return->refunds()->create([
            'order_id' => $return->order_id,
            'amount' => $request->input('amount'),
            'payment_method_id' => $request->input('payment_method_id'),
            'processed_by' => auth()->id(),
            'status' => 'processed',
            'processed_at' => now(),
        ]);

        $return->update([
            'status' => 'refunded',
            'refunded_at' => now(),
        ]);

        return $this->success($refund, 'Refund processed successfully');
    }
}
