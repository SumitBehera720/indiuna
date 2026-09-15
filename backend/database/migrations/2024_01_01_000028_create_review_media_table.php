<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('review_media', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('review_id');
            $table->enum('type', ['image', 'video'])->default('image');
            $table->string('url', 500);
            $table->string('thumbnail_url', 500)->nullable();
            $table->text('description')->nullable();
            $table->integer('sort_order')->default(0);
            $table->timestamps();

            $table->index('review_id');

            $table->foreign('review_id')
                ->references('id')
                ->on('reviews')
                ->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('review_media');
    }
};
