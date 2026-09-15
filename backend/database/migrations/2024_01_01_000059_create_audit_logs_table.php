<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('audit_logs', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('event', 100);
            $table->uuid('target_id')->nullable();
            $table->string('target_type', 100)->nullable();
            $table->uuid('actor_id')->nullable();
            $table->string('actor_type', 100)->nullable();
            $table->string('ip_address', 45)->nullable();
            $table->string('user_agent', 500)->nullable();
            $table->json('old_values')->nullable();
            $table->json('new_values')->nullable();
            $table->text('description')->nullable();
            $table->timestamps();

            $table->index('event');
            $table->index(['target_type', 'target_id'], 'audit_logs_target_index');
            $table->index(['actor_type', 'actor_id'], 'audit_logs_actor_index');
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('audit_logs');
    }
};
