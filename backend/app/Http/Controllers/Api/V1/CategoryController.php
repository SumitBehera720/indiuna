<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Category\StoreCategoryRequest;
use App\Http\Requests\Api\V1\Category\UpdateCategoryRequest;
use App\Http\Resources\CategoryResource;
use App\Models\Category;
use App\Services\CategoryService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    public function __construct(
        private readonly CategoryService $categoryService,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $categories = $this->categoryService->getAll();

        return $this->success(CategoryResource::collection($categories));
    }

    public function show(string $id): JsonResponse
    {
        $category = $this->categoryService->getById($id);

        if (!$category) {
            return $this->error('Category not found', 404);
        }

        return $this->success(new CategoryResource($category));
    }

    public function store(StoreCategoryRequest $request): JsonResponse
    {
        $category = $this->categoryService->create($request->validated());

        return $this->success(new CategoryResource($category), 'Category created successfully', 201);
    }

    public function update(string $id, UpdateCategoryRequest $request): JsonResponse
    {
        $category = $this->categoryService->update($id, $request->validated());

        return $this->success(new CategoryResource($category), 'Category updated successfully');
    }

    public function destroy(string $id): JsonResponse
    {
        $this->categoryService->delete($id);

        return $this->success(null, 'Category deleted successfully');
    }

    public function tree(): JsonResponse
    {
        $tree = $this->categoryService->getTree();

        return $this->success(CategoryResource::collection($tree));
    }

    public function reorder(Request $request): JsonResponse
    {
        $request->validate([
            'order' => 'required|array',
            'order.*.id' => 'required|string',
            'order.*.sort_order' => 'required|integer',
        ]);

        $this->categoryService->reorder($request->input('order'));

        return $this->success(null, 'Categories reordered successfully');
    }

    public function restore(string $id): JsonResponse
    {
        $category = Category::onlyTrashed()->findOrFail($id);
        $category->restore();

        return $this->success(new CategoryResource($category), 'Category restored successfully');
    }

    public function trashed(): JsonResponse
    {
        $categories = Category::onlyTrashed()->paginate(15);

        return $this->paginated($categories, CategoryResource::class);
    }
}
