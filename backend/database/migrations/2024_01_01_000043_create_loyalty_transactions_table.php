<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('loyalty_transactions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('loyalty_point_id');
            $table->uuid('order_id')->nullable();
            $table->enum('type', ['earn', 'redeem', 'expire', 'adjust'])->default('earn');
            $table->integer('points');
            $table->integer('balance_before');
            $table->integer('balance_after');
            $table->string('description', 500)->nullable();
            $table->string('reference_type', 100)->nullable();
            $table->uuid('reference_id')->nullable();
            $table->date('expires_at')->nullable();
            $table->timestamps();

            $table->index('loyalty_point_id');
            $table->index('order_id');
            $table->index('type');
            $table->index(['reference_type', 'reference_id'], 'loyalty_transactions_reference_index');

            $table->foreign('loyalty_point_id')
                ->references('id')
                ->on('loyalty_points')
                ->onDelete('cascade');

            $table->foreign('order_id')
                ->references('id')
                ->on('orders')
                ->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('loyalty_transactions');
    }
};
