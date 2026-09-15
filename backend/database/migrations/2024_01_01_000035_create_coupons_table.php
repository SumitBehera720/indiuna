<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('coupons', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('code', 50)->unique();
            $table->string('name', 255)->nullable();
            $table->text('description')->nullable();
            $table->enum('type', ['fixed', 'percentage', 'free_shipping', 'buy_x_get_y'])->default('fixed');
            $table->decimal('value', 12, 2)->default(0);
            $table->decimal('min_order_amount', 12, 2)->nullable();
            $table->decimal('max_discount', 12, 2)->nullable();
            $table->integer('usage_limit_per_coupon')->nullable();
            $table->integer('usage_limit_per_customer')->nullable();
            $table->integer('total_used')->default(0);
            $table->boolean('is_active')->default(true);
            $table->date('starts_at')->nullable();
            $table->date('expires_at')->nullable();
            $table->json('conditions')->nullable();
            $table->json('meta_data')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index('type');
            $table->index('is_active');
            $table->index(['starts_at', 'expires_at'], 'coupons_date_range_index');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('coupons');
    }
};
