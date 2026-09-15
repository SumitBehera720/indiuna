<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('products', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('brand_id')->nullable();
            $table->string('name', 500);
            $table->string('slug', 500)->unique();
            $table->text('short_description')->nullable();
            $table->longText('description')->nullable();
            $table->enum('type', ['simple', 'variable', 'custom'])->default('simple');
            $table->json('tags')->nullable();
            $table->string('seo_title', 70)->nullable();
            $table->string('seo_description', 160)->nullable();
            $table->string('og_image', 500)->nullable();
            $table->string('og_title', 70)->nullable();
            $table->string('og_description', 200)->nullable();
            $table->string('twitter_card', 100)->nullable();
            $table->enum('status', ['draft', 'published', 'scheduled', 'archived'])->default('draft');
            $table->timestamp('published_at')->nullable();
            $table->timestamp('scheduled_at')->nullable();
            $table->boolean('is_featured')->default(false);
            $table->json('meta_data')->nullable();
            $table->char('created_by', 36)->nullable();
            $table->char('updated_by', 36)->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index('brand_id');
            $table->index('status');
            $table->index('is_featured');

            $table->foreign('brand_id')
                ->references('id')
                ->on('brands')
                ->onDelete('set null');

            $table->foreign('created_by')
                ->references('id')
                ->on('users')
                ->onDelete('set null');

            $table->foreign('updated_by')
                ->references('id')
                ->on('users')
                ->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
