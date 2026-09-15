<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Hash;

class SetAdminPassword extends Command
{
    protected $signature = 'indiuna:admin-password {password?} {--email=admin@indiuna.com}';

    protected $description = 'Set a strong password for the super admin account';

    public function handle(): int
    {
        $password = $this->argument('password');
        $email = $this->option('email');

        $user = User::where('email', $email)->first();

        if (!$user) {
            $this->error("No user found with email: {$email}");

            return self::FAILURE;
        }

        if (!$password) {
            $password = $this->secret('Enter a new password (min 12 characters):');

            if (!$password || strlen($password) < 12) {
                $this->error('Password must be at least 12 characters.');

                return self::FAILURE;
            }
        }

        $user->update([
            'password' => Hash::make($password),
        ]);

        $this->info("Password updated for {$email}.");

        return self::SUCCESS;
    }
}
