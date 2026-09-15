<?php
declare(strict_types=1);

namespace App\Repositories;

use App\Contracts\Repositories\InventoryRepositoryInterface;
use App\DTOs\Inventory\StockAdjustmentDTO;
use App\Models\Inventory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Collection;

class InventoryRepository extends BaseRepository implements InventoryRepositoryInterface
{
    public function __construct()
    {
        parent::__construct(new Inventory());
    }

    public function findByVariantAndWarehouse(string $variantId, string $warehouseId): ?Model
    {
        return $this->model->where('variant_id', $variantId)
            ->where('warehouse_id', $warehouseId)
            ->first();
    }

    public function getMovements(string $variantId): Collection
    {
        $inventory = $this->model->where('variant_id', $variantId)->first();

        if (!$inventory) {
            return new Collection();
        }

        return $inventory->stockMovements()
            ->with(['warehouse', 'user'])
            ->get();
    }

    public function getAlerts(int $threshold = 5): Collection
    {
        return $this->model->where('available_quantity', '<=', $threshold)->get();
    }

    public function adjustStock(StockAdjustmentDTO $dto): Model
    {
        $inventory = $this->findByVariantAndWarehouse($dto->variant_id, $dto->warehouse_id);

        if (!$inventory) {
            $inventory = $this->create([
                'variant_id' => $dto->variant_id,
                'warehouse_id' => $dto->warehouse_id,
                'available_quantity' => 0,
            ]);
        }

        $inventory->stockMovements()->create([
            'variant_id' => $dto->variant_id,
            'warehouse_id' => $dto->warehouse_id,
            'quantity' => $dto->quantity,
            'type' => $dto->type,
            'reason' => $dto->reason,
            'reference_type' => $dto->reference_type,
            'reference_id' => $dto->reference_id,
            'notes' => $dto->notes,
        ]);

        $newQuantity = $dto->type->isIncoming()
            ? $inventory->available_quantity + $dto->quantity
            : $inventory->available_quantity - $dto->quantity;

        $inventory->update(['available_quantity' => max(0, $newQuantity)]);

        return $inventory->fresh();
    }
}
