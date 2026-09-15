<?php
declare(strict_types=1);

namespace App\Actions\Inventory;

use App\DTOs\Inventory\StockAdjustmentDTO;
use App\Events\Product\ProductStockLow;
use App\Models\Inventory;
use App\Models\ProductVariant;
use App\Models\StockMovement;
use App\Repositories\InventoryRepository;
use Illuminate\Support\Facades\DB;

class AdjustStockAction
{
    public function __construct(
        private readonly InventoryRepository $inventoryRepository,
    ) {}

    public function execute(StockAdjustmentDTO $dto): Inventory
    {
        return DB::transaction(function () use ($dto) {
            $inventory = $this->inventoryRepository->findByVariantAndWarehouse(
                $dto->variant_id,
                $dto->warehouse_id
            );

            if (!$inventory) {
                $inventory = $this->inventoryRepository->create([
                    'variant_id' => $dto->variant_id,
                    'warehouse_id' => $dto->warehouse_id,
                    'quantity' => 0,
                    'reserved_quantity' => 0,
                ]);
            }

            $beforeQuantity = $inventory->quantity;

            if ($dto->type->isIncoming()) {
                $inventory->increment('quantity', $dto->quantity);
            } else {
                $inventory->decrement('quantity', $dto->quantity);
            }

            $inventory = $inventory->fresh();

            StockMovement::create([
                'variant_id' => $dto->variant_id,
                'warehouse_id' => $dto->warehouse_id,
                'type' => $dto->type,
                'quantity' => $dto->quantity,
                'before_quantity' => $beforeQuantity,
                'after_quantity' => $inventory->quantity,
                'reason' => $dto->reason,
                'reference_type' => $dto->reference_type,
                'reference_id' => $dto->reference_id,
                'notes' => $dto->notes,
                'user_id' => auth()->id(),
            ]);

            $variant = ProductVariant::find($dto->variant_id);
            $threshold = $inventory->low_stock_threshold ?? $variant?->low_stock_threshold ?? 5;

            if ($inventory->quantity <= $threshold) {
                event(new ProductStockLow($variant, $inventory));
            }

            return $inventory->load(['variant', 'warehouse']);
        });
    }
}
