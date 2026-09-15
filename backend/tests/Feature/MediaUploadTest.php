<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class MediaUploadTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_upload_image_successfully(): void
    {
        Storage::fake('public');

        $user = User::create([
            'email' => 'admin@indiuna.com',
            'first_name' => 'Admin',
            'last_name' => 'User',
            'password' => bcrypt('password'),
            'email_verified_at' => now(),
        ]);

        Sanctum::actingAs($user);

        // Upload a JPEG image
        $file = UploadedFile::fake()->image('test_product.jpg', 600, 600);

        $response = $this->postJson('/api/v1/admin/media/upload', [
            'file' => $file,
        ]);

        $response->assertStatus(201);
        $response->assertJsonStructure([
            'data' => [
                'id',
                'folder_id',
                'name',
                'file_name',
                'mime_type',
                'size',
                'width',
                'height',
                'url',
                'thumbnail_url',
                'alt_text',
                'created_at',
            ]
        ]);

        // Assert files are stored
        $fileName = $response->json('data.file_name');
        Storage::disk('public')->assertExists('media/general/' . $fileName);
        Storage::disk('public')->assertExists('media/general/thumb_' . $fileName);
        Storage::disk('public')->assertExists('media/general/' . pathinfo($fileName, PATHINFO_FILENAME) . '.webp');
    }
}
