<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\ProductQuestion;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProductQuestionController extends Controller
{
    public function __construct(
        private readonly ProductQuestion $productQuestion,
    ) {}

    /**
     * Get approved questions for a product.
     */
    public function index(string $productId): JsonResponse
    {
        $questions = $this->productQuestion
            ->with('customer')
            ->where('product_id', $productId)
            ->where('is_approved', true)
            ->orderByDesc('created_at')
            ->get();

        return $this->success($questions->map(function ($q) {
            return [
                'id' => $q->id,
                'question' => $q->question,
                'answer' => $q->answer,
                'customer_name' => $q->customer_name ?: ($q->customer ? trim($q->customer->first_name . ' ' . $q->customer->last_name) : 'Guest'),
                'created_at' => $q->created_at->toISOString(),
            ];
        }));
    }

    /**
     * Submit a question for a product.
     */
    public function store(string $productId, Request $request): JsonResponse
    {
        $request->validate([
            'question' => ['required', 'string', 'min:5', 'max:1000'],
        ]);

        $product = Product::findOrFail($productId);
        $user = $request->user();
        $customer = $user->customer;

        $question = $this->productQuestion->create([
            'product_id' => $product->id,
            'customer_id' => $customer?->id,
            'customer_name' => $user ? trim($user->first_name . ' ' . $user->last_name) : 'Guest',
            'question' => $request->input('question'),
            'is_approved' => true, // Auto-approve for local demo / ease of testing
        ]);

        return $this->success($question, 'Question submitted successfully', 201);
    }
}
