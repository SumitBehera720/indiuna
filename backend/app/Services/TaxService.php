<?php
declare(strict_types=1);

namespace App\Services;

use App\Helpers\PriceHelper;
use App\Models\TaxRate;
use Illuminate\Database\Eloquent\Collection;

class TaxService
{
    public function getRates(): Collection
    {
        return TaxRate::where('is_active', true)
            ->orderBy('priority')
            ->get();
    }

    public function calculateTax(float $subtotal, ?string $taxCategoryId, string $location): array
    {
        $query = TaxRate::where('is_active', true)
            ->where(function ($q) use ($location) {
                $q->where('country', substr($location, 0, 2))
                    ->orWhereNull('country');
            });

        if ($taxCategoryId) {
            $query->where(function ($q) use ($taxCategoryId) {
                $q->where('tax_category_id', $taxCategoryId)
                    ->orWhereNull('tax_category_id');
            });
        }

        $rates = $query->orderBy('priority')->get();

        $taxBreakdown = [];
        $totalTax = 0.0;

        foreach ($rates as $rate) {
            $taxAmount = PriceHelper::calculateTax($subtotal, (float) $rate->rate);
            $taxBreakdown[] = [
                'name' => $rate->name,
                'rate' => (float) $rate->rate,
                'amount' => $taxAmount,
                'is_compound' => (bool) $rate->is_compound,
            ];

            if ($rate->is_compound) {
                $subtotal += $taxAmount;
            }

            $totalTax += $taxAmount;
        }

        return [
            'tax_breakdown' => $taxBreakdown,
            'total_tax' => round($totalTax, 2),
            'taxable_amount' => $subtotal,
        ];
    }
}
