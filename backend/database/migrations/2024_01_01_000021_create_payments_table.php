<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payments', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('order_id');
            $table->uuid('invoice_id')->nullable();
            $table->string('transaction_id', 255)->nullable()->unique();
            $table->string('payment_method', 100);
            $table->string('payment_method_name', 255)->nullable();
            $table->enum('status', ['pending', 'processing', 'completed', 'failed', 'refunded', 'partially_refunded', 'cancelled'])->default('pending');
            $table->decimal('amount', 12, 2);
            $table->decimal('fee', 12, 2)->default(0);
            $table->decimal('net_amount', 12, 2)->default(0);
            $table->string('currency', 3)->default('INR');
            $table->string('payer_name', 255)->nullable();
            $table->string('payer_email', 255)->nullable();
            $table->string('payer_phone', 20)->nullable();
            $table->text('notes')->nullable();
            $table->json('gateway_response')->nullable();
            $table->json('meta_data')->nullable();
            $table->timestamp('paid_at')->nullable();
            $table->timestamp('refunded_at')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index('order_id');
            $table->index('invoice_id');
            $table->index('status');

            $table->foreign('order_id')
                ->references('id')
                ->on('orders')
                ->onDelete('cascade');

            $table->foreign('invoice_id')
                ->references('id')
                ->on('invoices')
                ->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
