<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('refunds', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('order_id');
            $table->uuid('return_id')->nullable();
            $table->uuid('payment_id')->nullable();
            $table->string('refund_number', 50)->unique();
            $table->enum('status', ['pending', 'processing', 'completed', 'failed'])->default('pending');
            $table->enum('method', ['original', 'store_credit', 'bank_transfer', 'cash', 'other'])->default('original');
            $table->decimal('amount', 12, 2);
            $table->decimal('fee', 12, 2)->default(0);
            $table->decimal('net_amount', 12, 2)->default(0);
            $table->string('currency', 3)->default('INR');
            $table->string('transaction_id', 255)->nullable();
            $table->text('reason')->nullable();
            $table->text('notes')->nullable();
            $table->json('meta_data')->nullable();
            $table->char('created_by', 36)->nullable();
            $table->timestamp('refunded_at')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index('order_id');
            $table->index('return_id');
            $table->index('payment_id');
            $table->index('status');

            $table->foreign('order_id')
                ->references('id')
                ->on('orders')
                ->onDelete('cascade');

            $table->foreign('return_id')
                ->references('id')
                ->on('returns')
                ->onDelete('set null');

            $table->foreign('payment_id')
                ->references('id')
                ->on('payments')
                ->onDelete('set null');

            $table->foreign('created_by')
                ->references('id')
                ->on('users')
                ->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('refunds');
    }
};
