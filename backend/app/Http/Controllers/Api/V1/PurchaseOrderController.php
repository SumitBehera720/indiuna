<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\PurchaseOrder\StorePurchaseOrderRequest;
use App\Http\Requests\Api\V1\PurchaseOrder\UpdatePurchaseOrderRequest;
use App\Http\Resources\PurchaseOrderResource;
use App\Models\PurchaseOrder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PurchaseOrderController extends Controller
{
    public function __construct(
        private readonly PurchaseOrder $purchaseOrder,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $query = $this->purchaseOrder->with(['supplier', 'user', 'items']);

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        if ($request->filled('supplier_id')) {
            $query->where('supplier_id', $request->input('supplier_id'));
        }

        $orders = $query->paginate(15);

        return $this->paginated($orders, PurchaseOrderResource::class);
    }

    public function show(string $id): JsonResponse
    {
        $order = $this->purchaseOrder->with(['supplier', 'user', 'items'])->findOrFail($id);

        return $this->success(new PurchaseOrderResource($order));
    }

    public function store(StorePurchaseOrderRequest $request): JsonResponse
    {
        $data = $request->validated();
        $data['user_id'] = auth()->id();

        $order = $this->purchaseOrder->create($data);

        if (!empty($data['items'])) {
            foreach ($data['items'] as $item) {
                $order->items()->create($item);
            }
        }

        return $this->success(
            new PurchaseOrderResource($order->load('items')),
            'Purchase order created successfully',
            201
        );
    }

    public function update(string $id, UpdatePurchaseOrderRequest $request): JsonResponse
    {
        $order = $this->purchaseOrder->findOrFail($id);
        $order->update($request->validated());

        if ($request->has('items')) {
            $order->items()->delete();
            foreach ($request->input('items', []) as $item) {
                $order->items()->create($item);
            }
        }

        return $this->success(
            new PurchaseOrderResource($order->fresh()->load('items')),
            'Purchase order updated successfully'
        );
    }

    public function destroy(string $id): JsonResponse
    {
        $order = $this->purchaseOrder->findOrFail($id);
        $order->items()->delete();
        $order->delete();

        return $this->success(null, 'Purchase order deleted successfully');
    }

    public function receive(string $id, Request $request): JsonResponse
    {
        $request->validate([
            'items' => 'required|array',
            'items.*.id' => 'required|string',
            'items.*.received_quantity' => 'required|integer|min:0',
        ]);

        $order = $this->purchaseOrder->with('items')->findOrFail($id);

        foreach ($request->input('items', []) as $itemData) {
            $item = $order->items()->findOrFail($itemData['id']);
            $item->update([
                'received_quantity' => $itemData['received_quantity'],
                'status' => $itemData['received_quantity'] >= $item->quantity ? 'received' : 'partial',
            ]);
        }

        $allReceived = $order->items->every(fn($i) => $i->fresh()->status === 'received');
        $order->update([
            'status' => $allReceived ? 'received' : 'partial',
            'received_at' => now(),
        ]);

        return $this->success(
            new PurchaseOrderResource($order->fresh()->load('items')),
            'Purchase order received successfully'
        );
    }

    public function send(string $id): JsonResponse
    {
        $order = $this->purchaseOrder->findOrFail($id);
        $order->update(['status' => 'sent']);

        return $this->success(new PurchaseOrderResource($order->fresh()), 'Purchase order sent to supplier');
    }
}
