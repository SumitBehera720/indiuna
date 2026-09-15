<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Product;
use App\Models\Category;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ProductCrudTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;
    private Category $category;

    protected function setUp(): void
    {
        parent::setUp();

        $this->admin = User::create([
            'email' => 'admin@indiuna.com',
            'first_name' => 'Admin',
            'last_name' => 'User',
            'password' => bcrypt('password'),
            'email_verified_at' => now(),
        ]);

        $this->category = Category::create([
            'name' => 'Test Category',
            'slug' => 'test-category',
        ]);

        Sanctum::actingAs($this->admin);
    }

    public function test_product_crud_lifecycle(): void
    {
        // 1. CREATE
        $createResponse = $this->postJson('/api/v1/admin/products', [
            'name' => 'New Product',
            'slug' => 'new-product',
            'categories' => [$this->category->id],
            'status' => 'draft',
            'variants' => [
                [
                    'sku' => 'NEW-SKU-1',
                    'price' => 120.00,
                    'stock' => 15,
                    'is_active' => true,
                ]
            ],
            'images' => [
                [
                    'url' => 'https://indiuna.com/image.jpg',
                    'is_primary' => true,
                    'alt_text' => 'New Product',
                ]
            ]
        ]);

        $createResponse->assertStatus(201);
        $productId = $createResponse->json('data.id');
        $this->assertNotEmpty($productId);

        // 2. READ
        $readResponse = $this->getJson("/api/v1/admin/products/{$productId}");
        $readResponse->assertStatus(200);
        $readResponse->assertJsonPath('data.name', 'New Product');

        // 3. UPDATE
        $updateResponse = $this->putJson("/api/v1/admin/products/{$productId}", [
            'name' => 'Updated Product Name',
            'slug' => 'updated-product-name',
            'categories' => [$this->category->id],
            'variants' => [
                [
                    'sku' => 'NEW-SKU-1',
                    'price' => 130.00,
                    'stock' => 20,
                    'is_active' => true,
                ]
            ],
            'images' => [
                [
                    'url' => 'https://indiuna.com/image-updated.jpg',
                    'is_primary' => true,
                    'alt_text' => 'Updated Product Name',
                ]
            ]
        ]);

        $updateResponse->assertStatus(200);
        $updateResponse->assertJsonPath('data.name', 'Updated Product Name');

        // 4. DUPLICATE
        $duplicateResponse = $this->postJson("/api/v1/admin/products/{$productId}/duplicate");
        $duplicateResponse->assertStatus(200);
        $duplicateId = $duplicateResponse->json('data.id');
        $this->assertNotEmpty($duplicateId);
        $this->assertNotEquals($productId, $duplicateId);

        // 5. DELETE
        $deleteResponse = $this->deleteJson("/api/v1/admin/products/{$productId}");
        $deleteResponse->assertStatus(200);

        // Verify product is soft-deleted
        $this->assertNull(Product::find($productId));
        $this->assertNotNull(Product::withTrashed()->find($productId));

        // 6. RESTORE
        $restoreResponse = $this->postJson("/api/v1/admin/products/{$productId}/restore");
        $restoreResponse->assertStatus(200);
        $this->assertNotNull(Product::find($productId));
    }
}
