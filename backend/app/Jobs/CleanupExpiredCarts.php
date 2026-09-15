<?php
declare(strict_types=1);

namespace App\Jobs;

use App\Models\Cart;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;

class CleanupExpiredCarts implements ShouldQueue
{
    use Queueable;

    public function handle(): void
    {
        $expiredCarts = Cart::where('expires_at', '<', now())->get();

        $count = 0;
        foreach ($expiredCarts as $cart) {
            $cart->items()->delete();
            $cart->delete();
            $count++;
        }

        Log::info("Cleaned up {$count} expired carts");
    }
}
