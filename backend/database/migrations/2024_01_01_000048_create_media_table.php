<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('media', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('folder_id')->nullable();
            $table->uuid('user_id')->nullable();
            $table->string('name', 255);
            $table->string('file_name', 255);
            $table->string('mime_type', 100);
            $table->string('extension', 20);
            $table->integer('file_size');
            $table->string('url', 500);
            $table->string('thumbnail_url', 500)->nullable();
            $table->string('medium_url', 500)->nullable();
            $table->string('large_url', 500)->nullable();
            $table->string('alt_text', 255)->nullable();
            $table->string('title', 255)->nullable();
            $table->text('description')->nullable();
            $table->string('disk', 50)->default('local');
            $table->string('path', 500);
            $table->json('meta_data')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index('folder_id');
            $table->index('user_id');
            $table->index('mime_type');

            $table->foreign('folder_id')
                ->references('id')
                ->on('media_folders')
                ->onDelete('set null');

            $table->foreign('user_id')
                ->references('id')
                ->on('users')
                ->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('media');
    }
};
