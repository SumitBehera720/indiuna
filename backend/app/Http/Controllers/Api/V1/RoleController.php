<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Role\StoreRoleRequest;
use App\Http\Requests\Api\V1\Role\UpdateRoleRequest;
use Illuminate\Http\JsonResponse;
use Spatie\Permission\Models\Role;

class RoleController extends Controller
{
    public function __construct(
        private readonly Role $role,
    ) {}

    public function index(): JsonResponse
    {
        $roles = $this->role->with('permissions')->paginate(15);

        return $this->paginated($roles);
    }

    public function show(string $id): JsonResponse
    {
        $role = $this->role->with('permissions')->findOrFail($id);

        return $this->success($role);
    }

    public function store(StoreRoleRequest $request): JsonResponse
    {
        $role = $this->role->create(['name' => $request->input('name'), 'guard_name' => 'web']);

        if ($request->filled('permissions')) {
            $role->syncPermissions($request->input('permissions'));
        }

        return $this->success($role->load('permissions'), 'Role created successfully', 201);
    }

    public function update(string $id, UpdateRoleRequest $request): JsonResponse
    {
        $role = $this->role->findOrFail($id);
        $role->update(['name' => $request->input('name')]);

        if ($request->has('permissions')) {
            $role->syncPermissions($request->input('permissions'));
        }

        return $this->success($role->fresh()->load('permissions'), 'Role updated successfully');
    }

    public function destroy(string $id): JsonResponse
    {
        $role = $this->role->findOrFail($id);

        if ($role->name === 'admin' || $role->name === 'Super Admin') {
            return $this->error('Cannot delete system roles', 400);
        }

        $role->delete();

        return $this->success(null, 'Role deleted successfully');
    }
}
