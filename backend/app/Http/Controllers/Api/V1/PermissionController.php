<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class PermissionController extends Controller
{
    public function index(): JsonResponse
    {
        $permissions = Permission::all()->groupBy(function ($permission) {
            $parts = explode('.', $permission->name);

            return $parts[0] ?? 'general';
        });

        return $this->success($permissions);
    }

    public function updateMatrix(Request $request): JsonResponse
    {
        $request->validate([
            'role_id' => 'required|string',
            'permissions' => 'required|array',
            'permissions.*' => 'string',
        ]);

        $role = Role::findOrFail($request->input('role_id'));
        $role->syncPermissions($request->input('permissions'));

        return $this->success($role->load('permissions'), 'Permissions updated successfully');
    }
}
