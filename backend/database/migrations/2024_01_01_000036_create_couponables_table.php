<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('couponables', function (Blueprint $table) {
            $table->uuid('coupon_id');
            $table->uuid('couponable_id');
            $table->string('couponable_type');

            $table->index(['couponable_id', 'couponable_type'], 'couponables_couponable_index');

            $table->foreign('coupon_id')
                ->references('id')
                ->on('coupons')
                ->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('couponables');
    }
};
