<?php

namespace App\Http\Controllers\Api\V1;

use App\DTOs\Inventory\StockAdjustmentDTO;
use App\Enums\StockMovementType;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Inventory\AdjustStockRequest;
use App\Http\Requests\Api\V1\Inventory\TransferStockRequest;
use App\Http\Resources\InventoryResource;
use App\Services\InventoryService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class InventoryController extends Controller
{
    public function __construct(
        private readonly InventoryService $inventoryService,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $warehouseId = $request->input('warehouse_id');

        if ($warehouseId) {
            $inventory = $this->inventoryService->getByWarehouse($warehouseId);
        } else {
            $inventory = \App\Models\Inventory::with(['variant', 'warehouse'])->paginate(15);
            return $this->paginated($inventory, InventoryResource::class);
        }

        return $this->success(InventoryResource::collection($inventory));
    }

    public function show(string $variantId): JsonResponse
    {
        $inventory = $this->inventoryService->getByVariant($variantId);

        return $this->success(InventoryResource::collection($inventory));
    }

    public function adjust(AdjustStockRequest $request): JsonResponse
    {
        $dto = StockAdjustmentDTO::fromArray($request->validated());
        $inventory = $this->inventoryService->adjustStock($dto);

        return $this->success(new InventoryResource($inventory), 'Stock adjusted successfully');
    }

    public function movements(string $variantId): JsonResponse
    {
        $movements = $this->inventoryService->getMovements($variantId);

        return $this->success($movements);
    }

    public function alerts(): JsonResponse
    {
        $alerts = $this->inventoryService->getAlerts();

        return $this->success($alerts);
    }

    public function transfer(TransferStockRequest $request): JsonResponse
    {
        $result = $this->inventoryService->transfer(
            $request->input('variant_id'),
            $request->input('from_warehouse_id'),
            $request->input('to_warehouse_id'),
            $request->input('quantity')
        );

        return $this->success($result, 'Stock transferred successfully');
    }
}
