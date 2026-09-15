<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('order_number', 50)->unique();
            $table->uuid('user_id')->nullable();
            $table->uuid('customer_id')->nullable();
            $table->uuid('coupon_id')->nullable();
            $table->string('status', 50)->default('pending');
            $table->enum('payment_status', ['pending', 'paid', 'failed', 'refunded', 'partially_refunded'])->default('pending');
            $table->enum('fulfillment_status', ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'returned'])->default('pending');
            $table->decimal('subtotal', 12, 2)->default(0);
            $table->decimal('discount_total', 12, 2)->default(0);
            $table->decimal('shipping_total', 12, 2)->default(0);
            $table->decimal('tax_total', 12, 2)->default(0);
            $table->decimal('grand_total', 12, 2)->default(0);
            $table->decimal('paid_total', 12, 2)->default(0);
            $table->decimal('due_total', 12, 2)->default(0);
            $table->decimal('refund_total', 12, 2)->default(0);
            $table->string('currency', 3)->default('INR');
            $table->decimal('exchange_rate', 10, 4)->default(1);
            $table->integer('total_items')->default(0);
            $table->integer('total_quantity')->default(0);
            $table->string('coupon_code', 50)->nullable();
            $table->decimal('coupon_discount', 12, 2)->default(0);
            $table->string('shipping_method', 100)->nullable();
            $table->string('shipping_method_name', 255)->nullable();
            $table->string('payment_method', 100)->nullable();
            $table->string('payment_method_name', 255)->nullable();
            $table->string('payment_transaction_id', 255)->nullable();
            $table->timestamp('paid_at')->nullable();
            $table->text('notes')->nullable();
            $table->text('customer_notes')->nullable();
            $table->text('admin_notes')->nullable();
            $table->string('billing_first_name', 100);
            $table->string('billing_last_name', 100);
            $table->string('billing_company', 255)->nullable();
            $table->string('billing_address_line1', 500);
            $table->string('billing_address_line2', 500)->nullable();
            $table->string('billing_city', 100);
            $table->string('billing_state', 100);
            $table->string('billing_postal_code', 20);
            $table->string('billing_country', 100)->default('India');
            $table->string('billing_phone', 20)->nullable();
            $table->string('billing_email', 255)->nullable();
            $table->string('shipping_first_name', 100)->nullable();
            $table->string('shipping_last_name', 100)->nullable();
            $table->string('shipping_company', 255)->nullable();
            $table->string('shipping_address_line1', 500)->nullable();
            $table->string('shipping_address_line2', 500)->nullable();
            $table->string('shipping_city', 100)->nullable();
            $table->string('shipping_state', 100)->nullable();
            $table->string('shipping_postal_code', 20)->nullable();
            $table->string('shipping_country', 100)->nullable();
            $table->string('shipping_phone', 20)->nullable();
            $table->string('shipping_email', 255)->nullable();
            $table->string('ip_address', 45)->nullable();
            $table->string('user_agent', 500)->nullable();
            $table->string('source', 50)->nullable();
            $table->string('channel', 50)->default('web');
            $table->json('meta_data')->nullable();
            $table->char('created_by', 36)->nullable();
            $table->char('updated_by', 36)->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index('user_id');
            $table->index('customer_id');
            $table->index('status');
            $table->index('payment_status');
            $table->index('fulfillment_status');
            $table->index('created_by');
            $table->index('updated_by');

            $table->foreign('user_id')
                ->references('id')
                ->on('users')
                ->onDelete('set null');

            $table->foreign('customer_id')
                ->references('id')
                ->on('customers')
                ->onDelete('set null');

            // FK to coupons removed - coupons table created later

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
        Schema::dropIfExists('orders');
    }
};
