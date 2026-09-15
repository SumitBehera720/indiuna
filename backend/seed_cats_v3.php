<?php

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Category;

try {
    // Check if categories already exist
    if (Category::count() > 0) {
        echo "Categories already exist in database. Skipping seeding to prevent dataloss.\n";
        return;
    }

    echo "No categories found. Seeding categories...\n";

    // 2. Level 1 Categories
    $customization = Category::create([
        'name' => 'CUSTOMIZATION',
        'slug' => 'customization',
        'is_active' => 1,
        'image' => 'https://images.unsplash.com/photo-1605647540924-852290f6b0d5?q=80&w=800&auto=format&fit=crop',
        'show_in_pages' => 'home,customization',
        'gender' => 'all'
    ]);

    $embroidered = Category::create([
        'name' => 'EMBROIDERED APPAREL',
        'slug' => 'embroidered-apparel',
        'is_active' => 1,
        'image' => 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=800&auto=format&fit=crop',
        'show_in_pages' => 'home,embroidered',
        'gender' => 'all'
    ]);

    $patches = Category::create([
        'name' => 'PATCHES',
        'slug' => 'patches',
        'is_active' => 1,
        'image' => 'https://images.unsplash.com/photo-1578932750294-f5075e85f44a?q=80&w=800&auto=format&fit=crop',
        'show_in_pages' => 'home,patches',
        'gender' => 'all'
    ]);

    echo "Level 1 categories created.\n";

    // 3. Level 2 Categories
    $subCats = [
        'customization' => [
            'LOGO embroidery',
            'CUSTOMIZE Embroidery',
            'pet embroidery',
            'vechicle embroidery',
            'portrait embroidery'
        ],
        'embroidered' => [
            'Anime Universe',
            'Festive Collection',
            'IndiUna Signature',
            'Limited Edition',
            'Luxury Zone',
            'National Prides',
            'Nature Studio',
            'Spiritual Heritage',
            'Travel Series',
            'Urban Culture'
        ],
        'patches' => [
            'Iron on patches',
            'keychain patches',
            'magnetic patches',
            'Sew on patches'
        ]
    ];

    $parentMap = [
        'customization' => $customization,
        'embroidered' => $embroidered,
        'patches' => $patches
    ];

    foreach ($subCats as $key => $names) {
        $parent = $parentMap[$key];
        foreach ($names as $name) {
            $slug = strtolower(str_replace(' ', '-', $name));
            Category::create([
                'parent_id' => $parent->id,
                'name' => $name,
                'slug' => $slug,
                'is_active' => 1,
                'show_in_pages' => $key,
                'gender' => 'all'
            ]);
        }
    }

    echo "Level 2 categories successfully seeded!\n";
} catch (\Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
