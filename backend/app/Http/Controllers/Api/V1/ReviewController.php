<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Review\StoreReviewRequest;
use App\Http\Requests\Api\V1\Review\UpdateReviewRequest;
use App\Http\Resources\ReviewResource;
use App\Models\Review;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    public function __construct(
        private readonly Review $review,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $query = $this->review->with(['customer', 'product']);

        if ($request->filled('product_id')) {
            $query->where('product_id', $request->input('product_id'));
        }

        if ($request->filled('rating')) {
            $query->where('rating', $request->input('rating'));
        }

        if ($request->filled('status')) {
            $query->where('is_approved', $request->boolean('status'));
        }

        $reviews = $query->paginate(15);

        return $this->paginated($reviews, ReviewResource::class);
    }

    public function show(string $id): JsonResponse
    {
        $review = $this->review->with(['customer', 'product', 'media'])->findOrFail($id);

        return $this->success(new ReviewResource($review));
    }

    public function publicReviews(string $productId): JsonResponse
    {
        $reviews = $this->review
            ->with('customer')
            ->where('product_id', $productId)
            ->where('is_approved', true)
            ->orderByDesc('created_at')
            ->limit(20)
            ->get();

        return $this->success(ReviewResource::collection($reviews));
    }

    public function store(StoreReviewRequest $request): JsonResponse
    {
        $customer = $request->user()->customer;

        if (!$customer) {
            return $this->error('Customer profile not found', 404);
        }

        $review = $this->review->create(array_merge(
            $request->validated(),
            ['customer_id' => $customer->id]
        ));

        return $this->success(new ReviewResource($review), 'Review submitted successfully', 201);
    }

    public function update(string $id, UpdateReviewRequest $request): JsonResponse
    {
        $review = $this->review->findOrFail($id);
        $review->update($request->validated());

        return $this->success(new ReviewResource($review->fresh()), 'Review updated successfully');
    }

    public function destroy(string $id): JsonResponse
    {
        $review = $this->review->findOrFail($id);
        $review->delete();

        return $this->success(null, 'Review deleted successfully');
    }

    public function approve(string $id): JsonResponse
    {
        $review = $this->review->findOrFail($id);
        $review->update(['is_approved' => true]);

        return $this->success(new ReviewResource($review->fresh()), 'Review approved successfully');
    }

    public function feature(string $id): JsonResponse
    {
        $review = $this->review->findOrFail($id);
        $review->update(['is_featured' => !$review->is_featured]);

        return $this->success(
            new ReviewResource($review->fresh()),
            $review->is_featured ? 'Review featured successfully' : 'Review unfeatured successfully'
        );
    }
}
