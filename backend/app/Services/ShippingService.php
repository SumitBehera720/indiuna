<?php
declare(strict_types=1);

namespace App\Services;

use App\Models\ShippingMethod;
use App\Models\ShippingZone;
use App\Models\ShippingRate;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;

class ShippingService
{
    public function __construct(
        private readonly ShiprocketService $shiprocket,
    ) {}

    public function getMethods(): Collection
    {
        return ShippingMethod::where('is_active', true)
            ->orderBy('sort_order')
            ->get();
    }

    /**
     * Live courier rates from Shiprocket (empty when disabled or on error).
     *
     * @return array<int, array<string, mixed>>
     */
    public function getLiveRates(float $weight, string $postalCode, float $declaredValue, bool $cod): array
    {
        return $this->shiprocket->getServiceability($weight, $postalCode, $declaredValue, $cod);
    }

    /**
     * Resolve a shipping rate from the configured methods (fallback when no
     * zone-based rates match). Used by the storefront checkout.
     *
     * @return array{code: string|null, name: string|null, cost: float, estimated_days_min: int|null, estimated_days_max: int|null}
     */
    public function resolveRate(?string $methodCode, float $weight, float $subtotal, ?string $postalCode): array
    {
        $method = ShippingMethod::where('is_active', true)
            ->when($methodCode, fn ($q) => $q->where('code', $methodCode))
            ->orderBy('sort_order')
            ->first();

        $code = $method?->code;
        $name = $method?->name;

        if ($method && !$method->is_free && $method->min_order_amount && $subtotal >= $method->min_order_amount) {
            return [
                'code' => $code,
                'name' => $name,
                'cost' => 0.0,
                'estimated_days_min' => $method->estimated_days_min,
                'estimated_days_max' => $method->estimated_days_max,
            ];
        }

        if ($method) {
            $config = is_array($method->configuration)
                ? $method->configuration
                : (json_decode((string) $method->configuration, true) ?: []);

            return [
                'code' => $code,
                'name' => $name,
                'cost' => (float) ($config['base_rate'] ?? 0),
                'estimated_days_min' => (int) ($config['estimated_days_min'] ?? $method->estimated_days_min),
                'estimated_days_max' => (int) ($config['estimated_days_max'] ?? $method->estimated_days_max),
            ];
        }

        return [
            'code' => null,
            'name' => null,
            'cost' => 0.0,
            'estimated_days_min' => null,
            'estimated_days_max' => null,
        ];
    }

    public function calculateRate(string $methodId, float $weight, float $subtotal, string $postalCode): ?array
    {
        $method = ShippingMethod::with('zones.rates')
            ->where('id', $methodId)
            ->where('is_active', true)
            ->firstOrFail();

        $zone = $method->zones()
            ->where(function ($query) use ($postalCode) {
                $query->whereRaw('? BETWEEN postal_code_from AND postal_code_to', [$postalCode])
                    ->orWhere('countries', 'LIKE', '%' . substr($postalCode, 0, 2) . '%');
            })
            ->first();

        if (!$zone) {
            return null;
        }

        $rate = $zone->rates()
            ->where('is_active', true)
            ->where(function ($query) use ($weight, $subtotal) {
                $query->where(function ($q) use ($weight) {
                    $q->where('weight_from', '<=', $weight)
                        ->where(function ($q2) use ($weight) {
                            $q2->where('weight_to', '>=', $weight)
                                ->orWhereNull('weight_to');
                        });
                })->orWhere(function ($q) use ($subtotal) {
                    $q->where('subtotal_from', '<=', $subtotal)
                        ->where(function ($q2) use ($subtotal) {
                            $q2->where('subtotal_to', '>=', $subtotal)
                                ->orWhereNull('subtotal_to');
                        });
                });
            })
            ->first();

        if (!$rate) {
            return null;
        }

        $cost = (float) $rate->base_rate;

        if ($rate->rate_per_kg > 0 && $weight > 0) {
            $cost += ceil($weight) * (float) $rate->rate_per_kg;
        }

        if ($rate->rate_per_unit_currency > 0 && $subtotal > 0) {
            $cost += ($subtotal / 100) * (float) $rate->rate_per_unit_currency;
        }

        return [
            'method' => $method->name,
            'method_id' => $method->id,
            'zone' => $zone->name,
            'rate' => $rate->name,
            'cost' => round($cost, 2),
            'estimated_days' => $rate->estimated_days,
            'is_free_shipping' => $subtotal >= ($method->free_shipping_threshold ?? PHP_FLOAT_MAX),
        ];
    }
}
