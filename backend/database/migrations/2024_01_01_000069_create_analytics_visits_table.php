<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('analytics_visits', function (Blueprint $table) {
            $table->id();
            $table->string('visitor_id')->nullable();
            $table->string('ip_address')->nullable();
            $table->string('user_agent')->nullable();
            $table->string('url')->nullable();
            $table->string('referrer')->nullable();
            $table->string('device_type')->nullable();
            $table->string('browser')->nullable();
            $table->string('country')->nullable();
            $table->string('city')->nullable();
            $table->timestamps();

            $table->index('created_at');
            $table->index('visitor_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('analytics_visits');
    }
};
