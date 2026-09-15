<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('shipment_tracking', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('shipment_id');
            $table->string('location', 255)->nullable();
            $table->string('status', 100);
            $table->string('description', 500)->nullable();
            $table->timestamp('tracked_at')->nullable();
            $table->json('meta_data')->nullable();
            $table->timestamps();

            $table->index('shipment_id');

            $table->foreign('shipment_id')
                ->references('id')
                ->on('shipments')
                ->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('shipment_tracking');
    }
};
