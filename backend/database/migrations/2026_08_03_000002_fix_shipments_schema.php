<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('shipments', function (Blueprint $table) {
            $table->string('status', 50)->default('pending')->change();
            $table->timestamp('shipped_at')->nullable()->change();
            $table->timestamp('delivered_at')->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('shipments', function (Blueprint $table) {
            $table->enum('status', ['pending', 'label_created', 'picked_up', 'in_transit', 'out_for_delivery', 'delivered', 'failed', 'returned', 'cancelled'])->default('pending')->change();
            $table->date('shipped_at')->nullable()->change();
            $table->date('delivered_at')->nullable()->change();
        });
    }
};
