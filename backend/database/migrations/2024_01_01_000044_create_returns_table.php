<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('returns', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('return_number', 50)->unique();
            $table->uuid('order_id');
            $table->uuid('customer_id');
            $table->enum('status', ['requested', 'approved', 'rejected', 'pending_items', 'items_received', 'refund_pending', 'refunded', 'completed', 'cancelled'])->default('requested');
            $table->enum('reason', ['defective', 'not_as_described', 'wrong_item', 'size_issue', 'quality_issue', 'arrived_damaged', 'changed_mind', 'other'])->default('other');
            $table->text('customer_notes')->nullable();
            $table->text('admin_notes')->nullable();
            $table->enum('refund_method', ['original', 'store_credit', 'bank_transfer', 'other'])->nullable();
            $table->decimal('refund_amount', 12, 2)->default(0);
            $table->timestamp('requested_at');
            $table->timestamp('approved_at')->nullable();
            $table->timestamp('items_received_at')->nullable();
            $table->timestamp('refunded_at')->nullable();
            $table->json('meta_data')->nullable();
            $table->char('created_by', 36)->nullable();
            $table->char('updated_by', 36)->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index('order_id');
            $table->index('customer_id');
            $table->index('status');

            $table->foreign('order_id')
                ->references('id')
                ->on('orders')
                ->onDelete('cascade');

            $table->foreign('customer_id')
                ->references('id')
                ->on('customers')
                ->onDelete('cascade');

            $table->foreign('created_by')
                ->references('id')
                ->on('users')
                ->onDelete('set null');

            $table->foreign('updated_by')
                ->references('id')
                ->on('users')
                ->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('returns');
    }
};
