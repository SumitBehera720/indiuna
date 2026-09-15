<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Password;

echo "1. Testing Laravel Mail::raw()...\n";
try {
    Mail::raw('Test email from Indiuna backend via Brevo SMTP.', function($m) {
        $m->to('chyranjeet33@gmail.com')->subject('Indiuna Password Reset Verification Test');
    });
    echo "SUCCESS: Raw email sent via Brevo SMTP!\n";
} catch (\Throwable $e) {
    echo "FAILED Raw Mail: " . $e->getMessage() . "\n";
}

echo "\n2. Testing Password::sendResetLink()...\n";
try {
    $status = Password::sendResetLink(['email' => 'admin@indiuna.com']);
    echo "Status code: $status\n";
    if ($status === Password::RESET_LINK_SENT) {
        echo "SUCCESS: Password reset link generated and sent via email!\n";
    } else {
        echo "Password reset status: $status\n";
    }
} catch (\Throwable $e) {
    echo "FAILED Reset Link: " . $e->getMessage() . "\n";
}
