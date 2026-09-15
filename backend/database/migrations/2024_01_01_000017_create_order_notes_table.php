<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('order_notes', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('order_id');
            $table->char('user_id', 36)->nullable();
            $table->enum('type', ['internal', 'customer', 'system'])->default('internal');
            $table->text('notes');
            $table->boolean('is_visible_to_customer')->default(false);
            $table->timestamps();

            $table->index('order_id');
            $table->index('user_id');
            $table->index('type');

            $table->foreign('order_id')
                ->references('id')
                ->on('orders')
                ->onDelete('cascade');

            $table->foreign('user_id')
                ->references('id')
                ->on('users')
                ->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('order_notes');
    }
};
