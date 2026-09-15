<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('product_questions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('product_id');
            $table->uuid('customer_id')->nullable();
            $table->string('customer_name')->nullable();
            $table->text('question');
            $table->text('answer')->nullable();
            $table->boolean('is_approved')->default(true); // Approved by default for smooth storefront operation
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('product_id')->references('id')->on('products')->onDelete('cascade');
            $table->foreign('customer_id')->references('id')->on('customers')->onDelete('cascade');
            $table->index('is_approved');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('product_questions');
    }
};
