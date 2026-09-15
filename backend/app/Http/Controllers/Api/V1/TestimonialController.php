<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Testimonial\StoreTestimonialRequest;
use App\Http\Requests\Api\V1\Testimonial\UpdateTestimonialRequest;
use App\Http\Resources\TestimonialResource;
use App\Models\Testimonial;
use Illuminate\Http\JsonResponse;

class TestimonialController extends Controller
{
    public function __construct(
        private readonly Testimonial $testimonial,
    ) {}

    public function index(): JsonResponse
    {
        $testimonials = $this->testimonial->orderBy('sort_order')->paginate(15);

        return $this->paginated($testimonials, TestimonialResource::class);
    }

    public function show(string $id): JsonResponse
    {
        $testimonial = $this->testimonial->findOrFail($id);

        return $this->success(new TestimonialResource($testimonial));
    }

    public function store(StoreTestimonialRequest $request): JsonResponse
    {
        $testimonial = $this->testimonial->create($request->validated());

        return $this->success(new TestimonialResource($testimonial), 'Testimonial created successfully', 201);
    }

    public function update(string $id, UpdateTestimonialRequest $request): JsonResponse
    {
        $testimonial = $this->testimonial->findOrFail($id);
        $testimonial->update($request->validated());

        return $this->success(new TestimonialResource($testimonial->fresh()), 'Testimonial updated successfully');
    }

    public function destroy(string $id): JsonResponse
    {
        $testimonial = $this->testimonial->findOrFail($id);
        $testimonial->delete();

        return $this->success(null, 'Testimonial deleted successfully');
    }
}
