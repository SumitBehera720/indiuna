<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('gift_card_transactions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('gift_card_id');
            $table->uuid('order_id')->nullable();
            $table->enum('type', ['credit', 'debit', 'refund'])->default('credit');
            $table->decimal('amount', 12, 2);
            $table->decimal('balance_before', 12, 2);
            $table->decimal('balance_after', 12, 2);
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index('gift_card_id');
            $table->index('order_id');

            $table->foreign('gift_card_id')
                ->references('id')
                ->on('gift_cards')
                ->onDelete('cascade');

            $table->foreign('order_id')
                ->references('id')
                ->on('orders')
                ->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('gift_card_transactions');
    }
};
