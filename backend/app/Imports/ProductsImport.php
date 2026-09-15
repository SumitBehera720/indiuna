<?php
declare(strict_types=1);

namespace App\Imports;

use App\Models\Product;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\WithValidation;

class ProductsImport implements ToCollection, WithHeadingRow, WithValidation
{
    private int $successCount = 0;
    private int $failCount = 0;
    private array $errors = [];

    public function collection(Collection $rows): void
    {
        foreach ($rows as $row) {
            try {
                $product = Product::updateOrCreate(
                    ['sku' => $row['sku'] ?? $row['slug']],
                    $row->toArray()
                );
                $this->successCount++;
            } catch (\Exception $e) {
                $this->failCount++;
                $this->errors[] = "Row {$row->get('sku', 'unknown')}: {$e->getMessage()}";
            }
        }
    }

    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'slug' => 'required|string|max:255',
            'sku' => 'nullable|string|max:100',
        ];
    }

    public function getSuccessCount(): int
    {
        return $this->successCount;
    }

    public function getFailCount(): int
    {
        return $this->failCount;
    }

    public function getErrors(): array
    {
        return $this->errors;
    }
}
