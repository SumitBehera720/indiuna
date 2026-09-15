<?php
declare(strict_types=1);

namespace App\Exports;

use App\Models\Product;
use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class ProductsExport implements FromQuery, WithHeadings, WithMapping
{
    public function __construct(
        private readonly array $filters = [],
    ) {}

    public function query()
    {
        $query = Product::query()->with(['brand', 'categories']);

        if (!empty($this->filters['status'])) {
            $query->where('status', $this->filters['status']);
        }

        if (!empty($this->filters['category_id'])) {
            $query->whereHas('categories', fn ($q) => $q->where('id', $this->filters['category_id']));
        }

        if (!empty($this->filters['brand_id'])) {
            $query->where('brand_id', $this->filters['brand_id']);
        }

        return $query;
    }

    public function headings(): array
    {
        return [
            'ID', 'Name', 'Slug', 'SKU', 'Price', 'Status',
            'Category', 'Brand', 'Stock', 'Created At',
        ];
    }

    public function map($product): array
    {
        return [
            $product->id,
            $product->name,
            $product->slug,
            $product->variants->first()?->sku,
            $product->variants->first()?->price,
            $product->status->value,
            $product->categories->pluck('name')->implode(', '),
            $product->brand?->name,
            $product->variants->sum('stock'),
            $product->created_at->toDateTimeString(),
        ];
    }
}
