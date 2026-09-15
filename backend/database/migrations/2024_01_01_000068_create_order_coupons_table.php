<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('order_coupons', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('order_id')->constrained('orders')->cascadeOnDelete();
            $table->foreignUuid('coupon_id')->constrained('coupons')->cascadeOnDelete();
            $table->string('code');
            $table->decimal('discount_amount', 10, 2)->default(0);
            $table->string('discount_type')->nullable();
            $table->json('meta')->nullable();
            $table->timestamps();

            $table->index('order_id');
            $table->index('coupon_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('order_coupons');
    }
};
