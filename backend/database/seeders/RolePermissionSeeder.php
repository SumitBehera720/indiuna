<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RolePermissionSeeder extends Seeder
{
    public function run(): void
    {
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        $modules = [
            'products',
            'categories',
            'brands',
            'collections',
            'orders',
            'customers',
            'inventory',
            'coupons',
            'reviews',
            'returns',
            'blogs',
            'pages',
            'banners',
            'media',
            'newsletter',
            'settings',
            'staff',
            'roles',
        ];

        $actions = ['view', 'create', 'edit', 'delete', 'restore', 'bulk'];

        $permissions = [];

        foreach ($modules as $module) {
            foreach ($actions as $action) {
                $permission = Permission::firstOrCreate(['name' => "{$module}.{$action}", 'guard_name' => 'web']);
                $permissions[$module][] = $permission;
            }
        }

        $roles = [
            'super_admin' => [],
            'admin' => ['products', 'categories', 'brands', 'collections', 'orders', 'customers', 'inventory', 'coupons', 'reviews', 'returns', 'blogs', 'pages', 'banners', 'media', 'newsletter', 'settings', 'staff'],
            'manager' => ['products', 'categories', 'brands', 'collections', 'orders', 'customers', 'inventory', 'coupons', 'reviews', 'returns', 'blogs', 'pages', 'banners', 'media'],
            'warehouse' => ['products', 'inventory'],
            'support' => ['orders', 'customers', 'returns', 'reviews'],
            'finance' => ['orders', 'coupons', 'returns'],
        ];

        $roleActionMapping = [
            'admin' => ['view', 'create', 'edit', 'delete', 'restore', 'bulk'],
            'manager' => ['view', 'create', 'edit', 'delete', 'bulk'],
            'warehouse' => ['view', 'edit'],
            'support' => ['view', 'edit'],
            'finance' => ['view', 'edit'],
        ];

        foreach ($roles as $roleName => $modulesForRole) {
            $role = Role::firstOrCreate(['name' => $roleName, 'guard_name' => 'web']);

            if ($roleName === 'super_admin') {
                $role->syncPermissions(Permission::all());
                continue;
            }

            $rolePermissions = collect($modulesForRole)
                ->crossJoin($roleActionMapping[$roleName] ?? ['view', 'create', 'edit', 'delete'])
                ->map(fn($pair) => "{$pair[0]}.{$pair[1]}")
                ->toArray();

            $role->syncPermissions(Permission::whereIn('name', $rolePermissions)->get());
        }
    }
}
