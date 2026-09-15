<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Webhook\StoreWebhookRequest;
use App\Http\Requests\Api\V1\Webhook\UpdateWebhookRequest;
use App\Models\Webhook;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class WebhookController extends Controller
{
    public function __construct(
        private readonly Webhook $webhook,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $query = $this->webhook->orderByDesc('created_at');

        if ($request->filled('event')) {
            $query->where('event', $request->input('event'));
        }

        if ($request->filled('is_active')) {
            $query->where('is_active', $request->boolean('is_active'));
        }

        $webhooks = $query->paginate(15);

        return $this->paginated($webhooks);
    }

    public function show(string $id): JsonResponse
    {
        $webhook = $this->webhook->with('logs')->findOrFail($id);

        return $this->success($webhook);
    }

    public function store(StoreWebhookRequest $request): JsonResponse
    {
        $webhook = $this->webhook->create($request->validated());

        return $this->success($webhook, 'Webhook created successfully', 201);
    }

    public function update(string $id, UpdateWebhookRequest $request): JsonResponse
    {
        $webhook = $this->webhook->findOrFail($id);
        $webhook->update($request->validated());

        return $this->success($webhook->fresh(), 'Webhook updated successfully');
    }

    public function destroy(string $id): JsonResponse
    {
        $webhook = $this->webhook->findOrFail($id);
        $webhook->logs()->delete();
        $webhook->delete();

        return $this->success(null, 'Webhook deleted successfully');
    }

    public function logs(string $id): JsonResponse
    {
        $webhook = $this->webhook->findOrFail($id);

        return $this->success($webhook->logs()->orderByDesc('created_at')->paginate(15));
    }
}
