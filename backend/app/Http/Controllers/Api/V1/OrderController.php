<?php

namespace App\Http\Controllers\Api\V1;

use App\DTOs\Analytics\ReportFilterDTO;
use App\DTOs\Order\CreateOrderDTO;
use App\DTOs\Order\OrderFilterDTO;
use App\DTOs\Order\UpdateOrderStatusDTO;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Order\StoreOrderRequest;
use App\Http\Requests\Api\V1\Order\OrderFilterRequest;
use App\Http\Requests\Api\V1\Order\UpdateOrderStatusRequest;
use App\Http\Resources\OrderResource;
use App\Services\OrderService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    public function __construct(
        private readonly OrderService $orderService,
    ) {}

    public function index(OrderFilterRequest $request): JsonResponse
    {
        $filters = OrderFilterDTO::fromArray($request->validated());
        $orders = $this->orderService->getAll($filters);

        return $this->paginated($orders, OrderResource::class);
    }

    public function show(string $id): JsonResponse
    {
        $order = $this->orderService->getById($id);

        if (!$order) {
            return $this->error('Order not found', 404);
        }

        return $this->success(new OrderResource($order));
    }

    public function store(StoreOrderRequest $request): JsonResponse
    {
        $dto = CreateOrderDTO::fromArray($request->validated());
        $order = $this->orderService->createFromCart($dto);

        return $this->success(new OrderResource($order), 'Order created successfully', 201);
    }

    public function updateStatus(string $id, UpdateOrderStatusRequest $request): JsonResponse
    {
        $dto = UpdateOrderStatusDTO::fromArray($request->validated());
        $order = $this->orderService->updateStatus($id, $dto);

        return $this->success(new OrderResource($order), 'Order status updated successfully');
    }

    public function addNote(string $id, Request $request): JsonResponse
    {
        $request->validate([
            'note' => 'required|string',
            'customer_visible' => 'boolean',
        ]);

        $order = $this->orderService->addNote(
            $id,
            $request->input('note'),
            $request->boolean('customer_visible', false)
        );

        return $this->success(new OrderResource($order), 'Note added successfully');
    }

    public function timeline(string $id): JsonResponse
    {
        $timeline = $this->orderService->getTimeline($id);

        return $this->success($timeline);
    }

    public function bulkUpdateStatus(Request $request): JsonResponse
    {
        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'string',
            'status' => 'required|string',
        ]);

        $dto = UpdateOrderStatusDTO::fromArray($request->only('status', 'notes'));

        foreach ($request->input('ids', []) as $id) {
            $this->orderService->updateStatus($id, $dto);
        }

        return $this->success(null, 'Orders status updated successfully');
    }

    public function export(Request $request): JsonResponse
    {
        $filters = ReportFilterDTO::fromArray($request->all());
        $csv = (new \App\Services\ReportService(
            app(\App\Contracts\Repositories\OrderRepositoryInterface::class),
            app(\App\Contracts\Repositories\ProductRepositoryInterface::class),
            app(\App\Contracts\Repositories\CustomerRepositoryInterface::class),
            app(\App\Contracts\Repositories\CouponRepositoryInterface::class),
            app(\App\Contracts\Repositories\InventoryRepositoryInterface::class),
        ))->export('sales', $filters);

        return response()->streamDownload(function () use ($csv) {
            echo $csv;
        }, 'orders-export.csv', [
            'Content-Type' => 'text/csv',
        ]);
    }

    public function myOrders(Request $request): JsonResponse
    {
        $customerId = $request->user()->customer?->id;

        if (!$customerId) {
            return $this->error('Customer profile not found', 404);
        }

        $orders = $this->orderService->getMyOrders($customerId);

        return $this->paginated($orders, OrderResource::class);
    }
}
