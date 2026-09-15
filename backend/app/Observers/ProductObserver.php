<?php
declare(strict_types=1);

namespace App\Observers;

use App\Models\Product;
use Illuminate\Support\Facades\Auth;

class ProductObserver
{
    public function creating(Product $product): void
    {
        if (Auth::check()) {
            $product->created_by = Auth::id();
        }
    }

    public function updating(Product $product): void
    {
        if (Auth::check()) {
            $product->updated_by = Auth::id();
        }
    }
}
