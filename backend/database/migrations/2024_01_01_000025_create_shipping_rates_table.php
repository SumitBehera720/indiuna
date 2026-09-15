<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('shipping_rates', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('shipping_zone_id');
            $table->uuid('shipping_method_id');
            $table->string('name', 255);
            $table->enum('type', ['flat', 'percent', 'weight_based', 'price_based', 'free'])->default('flat');
            $table->decimal('rate', 12, 2)->default(0);
            $table->decimal('min_weight', 8, 2)->nullable();
            $table->decimal('max_weight', 8, 2)->nullable();
            $table->decimal('min_amount', 12, 2)->nullable();
            $table->decimal('max_amount', 12, 2)->nullable();
            $table->integer('min_items')->nullable();
            $table->integer('max_items')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index('shipping_zone_id');
            $table->index('shipping_method_id');

            $table->foreign('shipping_zone_id')
                ->references('id')
                ->on('shipping_zones')
                ->onDelete('cascade');

            $table->foreign('shipping_method_id')
                ->references('id')
                ->on('shipping_methods')
                ->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('shipping_rates');
    }
};
