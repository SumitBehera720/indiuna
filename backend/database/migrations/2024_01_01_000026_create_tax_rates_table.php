<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tax_rates', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name', 255);
            $table->string('code', 50)->nullable();
            $table->decimal('rate', 5, 2);
            $table->enum('type', ['percentage', 'fixed'])->default('percentage');
            $table->string('country', 100)->nullable();
            $table->string('state', 100)->nullable();
            $table->string('city', 100)->nullable();
            $table->string('postal_code', 20)->nullable();
            $table->boolean('is_active')->default(true);
            $table->boolean('is_compound')->default(false);
            $table->boolean('is_shipping')->default(false);
            $table->integer('priority')->default(1);
            $table->timestamps();

            $table->index(['country', 'state', 'city', 'postal_code'], 'tax_rates_location_index');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tax_rates');
    }
};
