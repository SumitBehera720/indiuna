<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\SupportTicket\StoreTicketRequest;
use App\Http\Requests\Api\V1\SupportTicket\UpdateTicketRequest;
use App\Http\Resources\SupportTicketResource;
use App\Models\SupportTicket;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SupportTicketController extends Controller
{
    public function __construct(
        private readonly SupportTicket $ticket,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $query = $this->ticket->with(['customer', 'assignedTo', 'messages']);

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        if ($request->filled('priority')) {
            $query->where('priority', $request->input('priority'));
        }

        if ($request->filled('assigned_to')) {
            $query->where('assigned_to', $request->input('assigned_to'));
        }

        $tickets = $query->orderByDesc('created_at')->paginate(15);

        return $this->paginated($tickets, SupportTicketResource::class);
    }

    public function show(string $id): JsonResponse
    {
        $ticket = $this->ticket->with(['customer', 'assignedTo', 'messages'])->findOrFail($id);

        return $this->success(new SupportTicketResource($ticket));
    }

    public function store(StoreTicketRequest $request): JsonResponse
    {
        $customer = $request->user()->customer;

        if (!$customer) {
            return $this->error('Customer profile not found', 404);
        }

        $ticket = $this->ticket->create([
            'customer_id' => $customer->id,
            'subject' => $request->input('subject'),
            'description' => $request->input('description'),
            'priority' => $request->input('priority', 'normal'),
            'status' => 'open',
            'order_id' => $request->input('order_id'),
        ]);

        if ($request->filled('message')) {
            $ticket->messages()->create([
                'sender_type' => 'customer',
                'sender_id' => $customer->id,
                'message' => $request->input('message'),
            ]);
        }

        return $this->success(
            new SupportTicketResource($ticket->load('messages')),
            'Ticket created successfully',
            201
        );
    }

    public function update(string $id, UpdateTicketRequest $request): JsonResponse
    {
        $ticket = $this->ticket->findOrFail($id);
        $ticket->update($request->validated());

        return $this->success(
            new SupportTicketResource($ticket->fresh()->load(['customer', 'assignedTo', 'messages'])),
            'Ticket updated successfully'
        );
    }

    public function destroy(string $id): JsonResponse
    {
        $ticket = $this->ticket->findOrFail($id);
        $ticket->messages()->delete();
        $ticket->delete();

        return $this->success(null, 'Ticket deleted successfully');
    }

    public function assign(string $id, Request $request): JsonResponse
    {
        $request->validate(['user_id' => 'required|string']);

        $ticket = $this->ticket->findOrFail($id);
        $ticket->update(['assigned_to' => $request->input('user_id')]);

        return $this->success(
            new SupportTicketResource($ticket->fresh()->load('assignedTo')),
            'Ticket assigned successfully'
        );
    }

    public function updateStatus(string $id, Request $request): JsonResponse
    {
        $request->validate(['status' => 'required|string|in:open,in_progress,resolved,closed']);

        $ticket = $this->ticket->findOrFail($id);
        $ticket->update(['status' => $request->input('status')]);

        return $this->success(
            new SupportTicketResource($ticket->fresh()),
            'Ticket status updated successfully'
        );
    }
}
