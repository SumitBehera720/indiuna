<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('gift_cards', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('code', 50)->unique();
            $table->decimal('initial_balance', 12, 2);
            $table->decimal('current_balance', 12, 2);
            $table->string('currency', 3)->default('INR');
            $table->uuid('sender_customer_id')->nullable();
            $table->uuid('recipient_customer_id')->nullable();
            $table->string('recipient_email', 255)->nullable();
            $table->string('recipient_name', 255)->nullable();
            $table->text('message')->nullable();
            $table->date('expires_at')->nullable();
            $table->enum('status', ['active', 'used', 'expired', 'disabled'])->default('active');
            $table->timestamps();
            $table->softDeletes();

            $table->index('status');
            $table->index('sender_customer_id');
            $table->index('recipient_customer_id');

            $table->foreign('sender_customer_id')
                ->references('id')
                ->on('customers')
                ->onDelete('set null');

            $table->foreign('recipient_customer_id')
                ->references('id')
                ->on('customers')
                ->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('gift_cards');
    }
};
