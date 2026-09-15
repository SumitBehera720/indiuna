<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('shipping_zone_shipping_method', function (Blueprint $table) {
            $table->foreignUuid('shipping_zone_id')->constrained('shipping_zones')->cascadeOnDelete();
            $table->foreignUuid('shipping_method_id')->constrained('shipping_methods')->cascadeOnDelete();
            $table->timestamps();

            $table->primary(['shipping_zone_id', 'shipping_method_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('shipping_zone_shipping_method');
    }
};
