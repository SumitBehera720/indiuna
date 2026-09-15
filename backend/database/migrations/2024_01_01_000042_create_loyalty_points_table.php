<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('loyalty_points', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('customer_id')->unique();
            $table->integer('points_balance')->default(0);
            $table->integer('lifetime_points')->default(0);
            $table->integer('redeemed_points')->default(0);
            $table->integer('expired_points')->default(0);
            $table->string('tier', 50)->default('regular');
            $table->timestamp('last_earned_at')->nullable();
            $table->timestamp('last_redeemed_at')->nullable();
            $table->timestamps();

            $table->foreign('customer_id')
                ->references('id')
                ->on('customers')
                ->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('loyalty_points');
    }
};
