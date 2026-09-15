<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\RefundResource;
use App\Models\Refund;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RefundController extends Controller
{
    public function __construct(
        private readonly Refund $refund,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $query = $this->refund->with(['order', 'return', 'processedBy']);

        if ($request->filled('order_id')) {
            $query->where('order_id', $request->input('order_id'));
        }

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        $refunds = $query->paginate(15);

        return $this->paginated($refunds, RefundResource::class);
    }

    public function show(string $id): JsonResponse
    {
        $refund = $this->refund->with(['order', 'return', 'processedBy'])->findOrFail($id);

        return $this->success(new RefundResource($refund));
    }

    public function process(Request $request): JsonResponse
    {
        $request->validate([
            'order_id' => 'required|string',
            'amount' => 'required|numeric|min:0',
            'payment_method_id' => 'required|string',
            'reason' => 'nullable|string',
        ]);

        $refund = $this->refund->create([
            'order_id' => $request->input('order_id'),
            'amount' => $request->input('amount'),
            'payment_method_id' => $request->input('payment_method_id'),
            'reason' => $request->input('reason'),
            'processed_by' => auth()->id(),
            'status' => 'processed',
            'processed_at' => now(),
        ]);

        return $this->success(
            new RefundResource($refund->load(['order', 'processedBy'])),
            'Refund processed successfully',
            201
        );
    }
}
