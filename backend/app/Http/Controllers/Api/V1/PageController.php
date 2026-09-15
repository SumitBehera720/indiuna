<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Page\StorePageRequest;
use App\Http\Requests\Api\V1\Page\UpdatePageRequest;
use App\Http\Resources\PageResource;
use App\Models\Page;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PageController extends Controller
{
    public function __construct(
        private readonly Page $page,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $query = $this->page->orderBy('sort_order');

        if ($request->filled('is_published')) {
            $query->where('is_published', $request->boolean('is_published'));
        }

        $pages = $query->paginate(15);

        return $this->paginated($pages, PageResource::class);
    }

    public function show(string $id): JsonResponse
    {
        $page = $this->page->findOrFail($id);

        return $this->success(new PageResource($page));
    }

    public function store(StorePageRequest $request): JsonResponse
    {
        $page = $this->page->create($request->validated());

        return $this->success(new PageResource($page), 'Page created successfully', 201);
    }

    public function update(string $id, UpdatePageRequest $request): JsonResponse
    {
        $page = $this->page->findOrFail($id);
        $page->update($request->validated());

        return $this->success(new PageResource($page->fresh()), 'Page updated successfully');
    }

    public function destroy(string $id): JsonResponse
    {
        $page = $this->page->findOrFail($id);
        $page->delete();

        return $this->success(null, 'Page deleted successfully');
    }
}
