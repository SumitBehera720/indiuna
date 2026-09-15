<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Staff\StoreStaffRequest;
use App\Http\Requests\Api\V1\Staff\UpdateStaffRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class StaffController extends Controller
{
    public function __construct(
        private readonly User $user,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $query = $this->user->role(['admin', 'staff']);

        if ($request->filled('role')) {
            $query->role($request->input('role'));
        }

        if ($request->filled('is_active')) {
            $query->where('is_active', $request->boolean('is_active'));
        }

        $staff = $query->paginate(15);

        return $this->paginated($staff, UserResource::class);
    }

    public function show(string $id): JsonResponse
    {
        $staff = $this->user->with('roles', 'permissions')->findOrFail($id);

        return $this->success(new UserResource($staff));
    }

    public function store(StoreStaffRequest $request): JsonResponse
    {
        $staff = $this->user->create([
            'name' => $request->input('name'),
            'email' => $request->input('email'),
            'password' => Hash::make($request->input('password')),
            'is_active' => $request->boolean('is_active', true),
        ]);

        if ($request->filled('role')) {
            $staff->assignRole($request->input('role'));
        }

        return $this->success(new UserResource($staff->load('roles')), 'Staff created successfully', 201);
    }

    public function update(string $id, UpdateStaffRequest $request): JsonResponse
    {
        $staff = $this->user->findOrFail($id);

        $data = $request->only(['name', 'email', 'is_active']);

        if ($request->filled('password')) {
            $data['password'] = Hash::make($request->input('password'));
        }

        $staff->update($data);

        if ($request->filled('role')) {
            $staff->syncRoles([$request->input('role')]);
        }

        return $this->success(
            new UserResource($staff->fresh()->load('roles')),
            'Staff updated successfully'
        );
    }

    public function destroy(string $id): JsonResponse
    {
        $staff = $this->user->findOrFail($id);

        if ($staff->id === auth()->id()) {
            return $this->error('Cannot delete your own account', 400);
        }

        $staff->delete();

        return $this->success(null, 'Staff deleted successfully');
    }

    public function toggleStatus(string $id): JsonResponse
    {
        $staff = $this->user->findOrFail($id);

        if ($staff->id === auth()->id()) {
            return $this->error('Cannot toggle your own status', 400);
        }

        $staff->update(['is_active' => !$staff->is_active]);

        return $this->success(
            new UserResource($staff->fresh()),
            $staff->is_active ? 'Staff activated successfully' : 'Staff deactivated successfully'
        );
    }
}
