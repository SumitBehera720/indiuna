<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\GiftCard\StoreGiftCardRequest;
use App\Http\Requests\Api\V1\GiftCard\UpdateGiftCardRequest;
use App\Http\Resources\GiftCardResource;
use App\Models\GiftCard;
use Illuminate\Http\JsonResponse;

class GiftCardController extends Controller
{
    public function __construct(
        private readonly GiftCard $giftCard,
    ) {}

    public function index(): JsonResponse
    {
        $giftCards = $this->giftCard->with(['customer', 'usedBy'])->paginate(15);

        return $this->paginated($giftCards, GiftCardResource::class);
    }

    public function show(string $id): JsonResponse
    {
        $giftCard = $this->giftCard->with(['customer', 'usedBy'])->findOrFail($id);

        return $this->success(new GiftCardResource($giftCard));
    }

    public function store(StoreGiftCardRequest $request): JsonResponse
    {
        $giftCard = $this->giftCard->create($request->validated());

        return $this->success(new GiftCardResource($giftCard), 'Gift card created successfully', 201);
    }

    public function update(string $id, UpdateGiftCardRequest $request): JsonResponse
    {
        $giftCard = $this->giftCard->findOrFail($id);
        $giftCard->update($request->validated());

        return $this->success(new GiftCardResource($giftCard->fresh()), 'Gift card updated successfully');
    }

    public function destroy(string $id): JsonResponse
    {
        $giftCard = $this->giftCard->findOrFail($id);
        $giftCard->delete();

        return $this->success(null, 'Gift card deleted successfully');
    }

    public function transactions(string $id): JsonResponse
    {
        $giftCard = $this->giftCard->with('transactions')->findOrFail($id);

        return $this->success($giftCard->transactions);
    }
}
