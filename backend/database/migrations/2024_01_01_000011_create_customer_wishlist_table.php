<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('customer_wishlist', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('customer_id');
            $table->uuid('product_id');
            $table->uuid('variant_id')->nullable();
            $table->timestamp('created_at')->nullable();

            $table->unique(['customer_id', 'product_id', 'variant_id'], 'wishlist_unique');

            $table->foreign('customer_id')
                ->references('id')
                ->on('customers')
                ->onDelete('cascade');

            $table->foreign('product_id')
                ->references('id')
                ->on('products')
                ->onDelete('cascade');

            $table->foreign('variant_id')
                ->references('id')
                ->on('product_variants')
                ->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('customer_wishlist');
    }
};
