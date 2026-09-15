<?php
declare(strict_types=1);

namespace App\Notifications;

use App\Models\ProductVariant;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class LowStockAlert extends Notification
{
    use Queueable;

    public function __construct(
        public ProductVariant $variant,
    ) {}

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toDatabase(object $notifiable): array
    {
        return [
            'variant_id' => $this->variant->id,
            'sku' => $this->variant->sku,
            'product_name' => $this->variant->product?->name,
            'current_stock' => $this->variant->stock,
            'message' => "Low stock alert: {$this->variant->sku} - {$this->variant->product?->name} ({$this->variant->stock} remaining)",
        ];
    }
}
