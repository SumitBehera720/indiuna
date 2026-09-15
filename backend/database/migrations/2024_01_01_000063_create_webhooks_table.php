<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('webhooks', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name', 255);
            $table->string('url', 500);
            $table->json('events');
            $table->string('secret', 500)->nullable();
            $table->enum('status', ['active', 'inactive', 'failed'])->default('active');
            $table->integer('timeout')->default(30);
            $table->integer('retry_limit')->default(3);
            $table->json('headers')->nullable();
            $table->text('description')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('webhooks');
    }
};
