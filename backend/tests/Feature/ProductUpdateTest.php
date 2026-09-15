<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Product;
use App\Models\Category;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ProductUpdateTest extends TestCase
{
    use RefreshDatabase;

    public function test_update_product_with_images_successfully(): void
    {
        $user = User::create([
            'email' => 'admin@indiuna.com',
            'first_name' => 'Admin',
            'last_name' => 'User',
            'password' => bcrypt('password'),
            'email_verified_at' => now(),
        ]);

        Sanctum::actingAs($user);

        $category = Category::create([
            'name' => 'Test Category',
            'slug' => 'test-category',
        ]);

        $product = Product::create([
            'name' => 'Test Product',
            'slug' => 'test-product',
            'description' => 'Test description',
            'status' => 'published',
            'is_featured' => true,
        ]);

        $product->categories()->sync([$category->id]);

        $response = $this->putJson("/api/v1/admin/products/{$product->id}", [
            'name' => 'Updated Product Name',
            'slug' => 'updated-product-name',
            'categories' => [$category->id],
            'variants' => [
                [
                    'sku' => 'TEST-SKU-1',
                    'price' => 100,
                    'stock' => 10,
                    'is_active' => true,
                ]
            ],
            'images' => [
                [
                    'url' => 'https://indiuna.com/storage/media/general/test-product-webp.webp',
                    'is_primary' => true,
                    'alt_text' => 'Updated Product Name',
                ]
            ]
        ]);

        $response->dump();
        $response->assertStatus(200);
    }
}
