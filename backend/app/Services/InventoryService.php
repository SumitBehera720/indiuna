<?php
declare(strict_types=1);

namespace App\Services;

use App\Contracts\Repositories\InventoryRepositoryInterface;
use App\DTOs\Inventory\StockAdjustmentDTO;
use App\Enums\StockMovementType;
use App\Exceptions\InsufficientStockException;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

class InventoryService
{
    public function __construct(
        private readonly InventoryRepositoryInterface $inventoryRepository,
    ) {}

    public function getByVariant(string $variantId): Collection
    {
        return $this->inventoryRepository->findByField('variant_id', $variantId);
    }

    public function adjustStock(StockAdjustmentDTO $dto): Model
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
                ]);
            }

            $adjusted = $this->inventoryRepository->adjustStock($dto);

            if ($adjusted->quantity <= 0) {
                event(new \App\Events\System\LowStockAlert($adjusted));
            }

            return $adjusted;
        });
    }

    public function transfer(string $variantId, string $fromWarehouseId, string $toWarehouseId, int $quantity): array
    {
        return DB::transaction(function () use ($variantId, $fromWarehouseId, $toWarehouseId, $quantity) {
            $sourceInventory = $this->inventoryRepository->findByVariantAndWarehouse(
                $variantId,
                $fromWarehouseId
            );

            if (!$sourceInventory || $sourceInventory->quantity < $quantity) {
                throw new InsufficientStockException(
                    "Insufficient stock in source warehouse"
                );
            }

            $outMovement = $this->inventoryRepository->adjustStock(new StockAdjustmentDTO(
                variant_id: $variantId,
                warehouse_id: $fromWarehouseId,
                quantity: $quantity,
                type: StockMovementType::Transfer,
                reason: "Transfer to warehouse {$toWarehouseId}",
                reference_type: 'warehouse',
                reference_id: $toWarehouseId,
            ));

            $inMovement = $this->inventoryRepository->adjustStock(new StockAdjustmentDTO(
                variant_id: $variantId,
                warehouse_id: $toWarehouseId,
                quantity: $quantity,
                type: StockMovementType::Transfer,
                reason: "Transfer from warehouse {$fromWarehouseId}",
                reference_type: 'warehouse',
                reference_id: $fromWarehouseId,
            ));

            return [$outMovement, $inMovement];
        });
    }

    public function getMovements(string $variantId): Collection
    {
        return $this->inventoryRepository->getMovements($variantId);
    }

    public function getAlerts(): Collection
    {
        return $this->inventoryRepository->getAlerts();
    }

    public function getByWarehouse(string $warehouseId): Collection
    {
        return $this->inventoryRepository->findByField('warehouse_id', $warehouseId);
    }
}
