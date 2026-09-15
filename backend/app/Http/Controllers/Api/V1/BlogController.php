<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Blog\StoreBlogRequest;
use App\Http\Requests\Api\V1\Blog\UpdateBlogRequest;
use App\Http\Resources\BlogResource;
use App\Models\Blog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BlogController extends Controller
{
    public function __construct(
        private readonly Blog $blog,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $query = $this->blog->with(['category', 'author']);

        if ($request->filled('category_id')) {
            $query->where('blog_category_id', $request->input('category_id'));
        }

        if ($request->filled('is_published')) {
            $query->where('is_published', $request->boolean('is_published'));
        }

        $blogs = $query->paginate(15);

        return $this->paginated($blogs, BlogResource::class);
    }

    public function show(string $id): JsonResponse
    {
        $blog = $this->blog->with(['category', 'author'])->findOrFail($id);

        return $this->success(new BlogResource($blog));
    }

    public function store(StoreBlogRequest $request): JsonResponse
    {
        $blog = $this->blog->create(array_merge(
            $request->validated(),
            ['author_id' => auth()->id()]
        ));

        return $this->success(new BlogResource($blog->load(['category', 'author'])), 'Blog created successfully', 201);
    }

    public function update(string $id, UpdateBlogRequest $request): JsonResponse
    {
        $blog = $this->blog->findOrFail($id);
        $blog->update($request->validated());

        return $this->success(
            new BlogResource($blog->fresh()->load(['category', 'author'])),
            'Blog updated successfully'
        );
    }

    public function destroy(string $id): JsonResponse
    {
        $blog = $this->blog->findOrFail($id);
        $blog->delete();

        return $this->success(null, 'Blog deleted successfully');
    }
}
