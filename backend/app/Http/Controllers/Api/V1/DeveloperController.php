<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Developer\StoreApiKeyRequest;
use App\Http\Requests\Api\V1\Developer\UpdateApiKeyRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DeveloperController extends Controller
{
    public function index(): JsonResponse
    {
        $keys = \App\Models\ApiKey::where('user_id', auth()->id())
            ->orderByDesc('created_at')
            ->paginate(15);

        return $this->paginated($keys);
    }

    public function show(string $id): JsonResponse
    {
        $key = \App\Models\ApiKey::where('user_id', auth()->id())->findOrFail($id);

        return $this->success($key);
    }

    public function store(StoreApiKeyRequest $request): JsonResponse
    {
        $key = \App\Models\ApiKey::create([
            'user_id' => auth()->id(),
            'name' => $request->input('name'),
            'key' => 'api_' . \Illuminate\Support\Str::random(40),
            'permissions' => $request->input('permissions', []),
            'is_active' => true,
            'last_used_at' => null,
            'expires_at' => $request->input('expires_at'),
        ]);

        return $this->success($key, 'API key created successfully', 201);
    }

    public function update(string $id, UpdateApiKeyRequest $request): JsonResponse
    {
        $key = \App\Models\ApiKey::where('user_id', auth()->id())->findOrFail($id);
        $key->update($request->only(['name', 'permissions', 'is_active', 'expires_at']));

        return $this->success($key->fresh(), 'API key updated successfully');
    }

    public function destroy(string $id): JsonResponse
    {
        $key = \App\Models\ApiKey::where('user_id', auth()->id())->findOrFail($id);
        $key->delete();

        return $this->success(null, 'API key deleted successfully');
    }
}
