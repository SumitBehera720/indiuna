<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Faq\StoreFaqRequest;
use App\Http\Requests\Api\V1\Faq\UpdateFaqRequest;
use App\Http\Resources\FaqResource;
use App\Models\Faq;
use Illuminate\Http\JsonResponse;

class FaqController extends Controller
{
    public function __construct(
        private readonly Faq $faq,
    ) {}

    public function index(): JsonResponse
    {
        $faqs = $this->faq->orderBy('sort_order')->paginate(15);

        return $this->paginated($faqs, FaqResource::class);
    }

    public function show(string $id): JsonResponse
    {
        $faq = $this->faq->findOrFail($id);

        return $this->success(new FaqResource($faq));
    }

    public function store(StoreFaqRequest $request): JsonResponse
    {
        $faq = $this->faq->create($request->validated());

        return $this->success(new FaqResource($faq), 'FAQ created successfully', 201);
    }

    public function update(string $id, UpdateFaqRequest $request): JsonResponse
    {
        $faq = $this->faq->findOrFail($id);
        $faq->update($request->validated());

        return $this->success(new FaqResource($faq->fresh()), 'FAQ updated successfully');
    }

    public function destroy(string $id): JsonResponse
    {
        $faq = $this->faq->findOrFail($id);
        $faq->delete();

        return $this->success(null, 'FAQ deleted successfully');
    }
}
