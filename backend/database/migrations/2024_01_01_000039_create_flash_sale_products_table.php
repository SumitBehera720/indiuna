<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('flash_sale_products', function (Blueprint $table) {
            $table->uuid('flash_sale_id');
            $table->uuid('product_id');
            $table->decimal('discount_value', 12, 2);
            $table->enum('discount_type', ['percentage', 'fixed'])->default('percentage');
            $table->integer('quantity_limit')->nullable();
            $table->integer('sold_count')->default(0);
            $table->integer('sort_order')->default(0);

            $table->primary(['flash_sale_id', 'product_id']);

            $table->foreign('flash_sale_id')
                ->references('id')
                ->on('flash_sales')
                ->onDelete('cascade');

            $table->foreign('product_id')
                ->references('id')
                ->on('products')
                ->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('flash_sale_products');
    }
};
