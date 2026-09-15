<?php
declare(strict_types=1);

namespace App\Contracts\Repositories;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Collection;
use App\DTOs\Inventory\StockAdjustmentDTO;

interface InventoryRepositoryInterface extends RepositoryInterface
{
    public function findByVariantAndWarehouse(string $variantId, string $warehouseId): ?Model;

    public function getMovements(string $variantId): Collection;

    public function getAlerts(int $threshold = 5): Collection;

    public function adjustStock(StockAdjustmentDTO $dto): Model;
}
