<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Blog\StoreBlogCategoryRequest;
use App\Http\Requests\Api\V1\Blog\UpdateBlogCategoryRequest;
use App\Http\Resources\BlogCategoryResource;
use App\Models\BlogCategory;
use Illuminate\Http\JsonResponse;

class BlogCategoryController extends Controller
{
    public function __construct(
        private readonly BlogCategory $blogCategory,
    ) {}

    public function index(): JsonResponse
    {
        $categories = $this->blogCategory->withCount('blogs')->paginate(15);

        return $this->paginated($categories, BlogCategoryResource::class);
    }

    public function show(string $id): JsonResponse
    {
        $category = $this->blogCategory->with('blogs')->findOrFail($id);

        return $this->success(new BlogCategoryResource($category));
    }

    public function store(StoreBlogCategoryRequest $request): JsonResponse
    {
        $category = $this->blogCategory->create($request->validated());

        return $this->success(new BlogCategoryResource($category), 'Blog category created successfully', 201);
    }

    public function update(string $id, UpdateBlogCategoryRequest $request): JsonResponse
    {
        $category = $this->blogCategory->findOrFail($id);
        $category->update($request->validated());

        return $this->success(new BlogCategoryResource($category->fresh()), 'Blog category updated successfully');
    }

    public function destroy(string $id): JsonResponse
    {
        $category = $this->blogCategory->findOrFail($id);

        if ($category->blogs()->count() > 0) {
            return $this->error('Cannot delete category with associated blogs', 409);
        }

        $category->delete();

        return $this->success(null, 'Blog category deleted successfully');
    }
}
