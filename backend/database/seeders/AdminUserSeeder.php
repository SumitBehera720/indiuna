<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;
use Spatie\Permission\Models\Role;

class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        $email = env('ADMIN_EMAIL', 'admin@indiuna.com');

        $password = env('ADMIN_PASSWORD');

        if (!$password) {
            $password = Str::random(24);

            $this->command?->warn(
                "No ADMIN_PASSWORD in .env — generated random password for {$email}: {$password}"
            );
        }

        $user = User::updateOrCreate(
            ['email' => $email],
            [
                'first_name' => 'Super',
                'last_name' => 'Admin',
                'password' => bcrypt($password),
                'is_active' => true,
            ],
        );

        $role = Role::firstOrCreate(['name' => 'super_admin', 'guard_name' => 'web']);
        $user->assignRole($role);
    }
}
