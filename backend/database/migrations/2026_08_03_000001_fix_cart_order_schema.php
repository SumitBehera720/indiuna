<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // carts: CartService relies on is_active + coupon_code
        Schema::table('carts', function (Blueprint $table) {
            $table->boolean('is_active')->default(true)->after('customer_id');
            $table->string('coupon_code', 50)->nullable()->after('coupon_id');
        });

        // orders: widen payment_status enum, add missing columns used by the domain
        Schema::table('orders', function (Blueprint $table) {
            $table->string('payment_status', 50)->default('pending')->change();
            $table->string('shipping_status', 50)->default('pending')->after('fulfillment_status');
            $table->boolean('is_gift')->default(false)->after('notes');
            $table->text('gift_message')->nullable()->after('is_gift');
        });

        DB::statement('UPDATE orders SET payment_status = "paid" WHERE payment_status = "completed"');
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn(['shipping_status', 'is_gift', 'gift_message']);
        });

        Schema::table('carts', function (Blueprint $table) {
            $table->dropColumn(['is_active', 'coupon_code']);
        });
    }
};
