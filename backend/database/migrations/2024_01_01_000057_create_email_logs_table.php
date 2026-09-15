<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('email_logs', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('campaign_id')->nullable();
            $table->uuid('subscriber_id')->nullable();
            $table->string('email_to', 255);
            $table->string('subject', 255);
            $table->enum('status', ['sent', 'delivered', 'opened', 'clicked', 'bounced', 'failed', 'unsubscribed'])->default('sent');
            $table->timestamp('sent_at')->nullable();
            $table->timestamp('opened_at')->nullable();
            $table->timestamp('clicked_at')->nullable();
            $table->text('error_message')->nullable();
            $table->json('meta_data')->nullable();
            $table->timestamps();

            $table->index('campaign_id');
            $table->index('subscriber_id');
            $table->index('status');
            $table->index('email_to');

            $table->foreign('campaign_id')
                ->references('id')
                ->on('email_campaigns')
                ->onDelete('set null');

            $table->foreign('subscriber_id')
                ->references('id')
                ->on('newsletter_subscribers')
                ->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('email_logs');
    }
};
