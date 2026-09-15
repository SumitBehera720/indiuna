<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AuditLogController extends Controller
{
    public function __construct(
        private readonly AuditLog $auditLog,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $query = $this->auditLog->with('actor')->orderByDesc('created_at');

        if ($request->filled('action')) {
            $query->where('event', $request->input('action'));
        }

        if ($request->filled('target_type')) {
            $query->where('target_type', $request->input('target_type'));
        }

        if ($request->filled('actor_id')) {
            $query->where('actor_id', $request->input('actor_id'));
        }

        $logs = $query->paginate(15);

        return $this->paginated($logs);
    }

    public function show(string $id): JsonResponse
    {
        $log = $this->auditLog->with('actor')->findOrFail($id);

        return $this->success($log);
    }
}
