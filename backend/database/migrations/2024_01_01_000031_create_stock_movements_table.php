<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('stock_movements', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('variant_id');
            $table->uuid('warehouse_id');
            $table->uuid('inventory_id');
            $table->enum('type', ['in', 'out', 'adjustment', 'transfer', 'return'])->default('adjustment');
            $table->string('reference_type', 100)->nullable();
            $table->uuid('reference_id')->nullable();
            $table->integer('quantity');
            $table->integer('quantity_before');
            $table->integer('quantity_after');
            $table->text('reason')->nullable();
            $table->char('created_by', 36)->nullable();
            $table->timestamps();

            $table->index('variant_id');
            $table->index('warehouse_id');
            $table->index('inventory_id');
            $table->index('type');
            $table->index(['reference_type', 'reference_id'], 'stock_movements_reference_index');

            $table->foreign('variant_id')
                ->references('id')
                ->on('product_variants')
                ->onDelete('cascade');

            $table->foreign('warehouse_id')
                ->references('id')
                ->on('warehouses')
                ->onDelete('cascade');

            $table->foreign('inventory_id')
                ->references('id')
                ->on('inventory')
                ->onDelete('cascade');

            $table->foreign('created_by')
                ->references('id')
                ->on('users')
                ->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('stock_movements');
    }
};
