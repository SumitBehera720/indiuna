<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Newsletter\CreateCampaignRequest;
use App\Http\Requests\Api\V1\Newsletter\SubscribeRequest;
use App\Http\Requests\Api\V1\Newsletter\UpdateCampaignRequest;
use App\Http\Resources\NewsletterSubscriberResource;
use App\Models\NewsletterSubscriber;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NewsletterController extends Controller
{
    public function __construct(
        private readonly NewsletterSubscriber $subscriber,
    ) {}

    public function subscribers(Request $request): JsonResponse
    {
        $query = $this->subscriber->orderByDesc('created_at');

        if ($request->filled('is_active')) {
            $query->where('is_active', $request->boolean('is_active'));
        }

        $subscribers = $query->paginate(15);

        return $this->paginated($subscribers, NewsletterSubscriberResource::class);
    }

    public function subscriberDestroy(string $id): JsonResponse
    {
        $subscriber = $this->subscriber->findOrFail($id);
        $subscriber->delete();

        return $this->success(null, 'Subscriber removed successfully');
    }

    public function createCampaign(CreateCampaignRequest $request): JsonResponse
    {
        $data = $request->validated();
        $data['status'] = 'draft';

        $campaign = \App\Models\NewsletterCampaign::create($data);

        return $this->success($campaign, 'Campaign created successfully', 201);
    }

    public function updateCampaign(string $id, UpdateCampaignRequest $request): JsonResponse
    {
        $campaign = \App\Models\NewsletterCampaign::findOrFail($id);
        $campaign->update($request->validated());

        return $this->success($campaign->fresh(), 'Campaign updated successfully');
    }

    public function sendCampaign(string $id): JsonResponse
    {
        $campaign = \App\Models\NewsletterCampaign::findOrFail($id);

        if ($campaign->status === 'sent') {
            return $this->error('Campaign has already been sent', 400);
        }

        $subscribers = $this->subscriber->where('is_active', true)->get();

        foreach ($subscribers as $subscriber) {
            \Illuminate\Support\Facades\Mail::to($subscriber->email)->queue(new \App\Mail\NewsletterCampaign($campaign));
        }

        $campaign->update([
            'status' => 'sent',
            'sent_at' => now(),
        ]);

        return $this->success($campaign->fresh(), 'Campaign sent successfully');
    }

    public function subscribe(SubscribeRequest $request): JsonResponse
    {
        $exists = $this->subscriber->where('email', $request->input('email'))->first();

        if ($exists) {
            if (!$exists->is_active) {
                $exists->update(['is_active' => true, 'unsubscribed_at' => null]);
            }

            return $this->success(
                new NewsletterSubscriberResource($exists->fresh()),
                'Already subscribed'
            );
        }

        $subscriber = $this->subscriber->create([
            'email' => $request->input('email'),
            'name' => $request->input('name'),
            'is_active' => true,
            'subscribed_at' => now(),
        ]);

        return $this->success(
            new NewsletterSubscriberResource($subscriber),
            'Subscribed successfully',
            201
        );
    }

    public function unsubscribe(Request $request): JsonResponse
    {
        $request->validate(['email' => 'required|email']);

        $subscriber = $this->subscriber->where('email', $request->input('email'))->first();

        if (!$subscriber) {
            return $this->error('Email not found in our subscribers list', 404);
        }

        $subscriber->update([
            'is_active' => false,
            'unsubscribed_at' => now(),
        ]);

        return $this->success(null, 'Unsubscribed successfully');
    }
}
