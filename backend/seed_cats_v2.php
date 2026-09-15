<?php

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Category;

try {
    // 1. Clear old category definitions permanently (resolves soft delete slug uniqueness constraint)
    Category::withTrashed()->forceDelete();

    echo "Cleared existing categories.\n";

    // 2. Level 1 Categories
    $customization = Category::create([
        'name' => 'CUSTOMIZATION',
        'slug' => 'customization',
        'is_active' => 1,
        'show_in_pages' => 'home,customization',
        'gender' => 'all'
    ]);

    $embroidered = Category::create([
        'name' => 'EMBROIDERED APPAREL',
        'slug' => 'embroidered-apparel',
        'is_active' => 1,
        'show_in_pages' => 'home,embroidered',
        'gender' => 'all'
    ]);

    $patches = Category::create([
        'name' => 'PATCHES',
        'slug' => 'patches',
        'is_active' => 1,
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

    // Options for Level 3
    $filterOptions = [
        'Oversized tshirt',
        'regular fit',
        'hoodie',
        'sweatshirts'
    ];

    foreach ($subCats as $key => $names) {
        $parent = $parentMap[$key];
        foreach ($names as $name) {
            $slug = strtolower(str_replace(' ', '-', $name));
            $sub = Category::create([
                'parent_id' => $parent->id,
                'name' => $name,
                'slug' => $slug,
                'is_active' => 1,
                'show_in_pages' => $key,
                'gender' => 'all'
            ]);

            // 4. Create Level 3 (Filter Options) under each subcategory
            foreach ($filterOptions as $opt) {
                $optSlug = $slug . '-' . strtolower(str_replace(' ', '-', $opt));
                Category::create([
                    'parent_id' => $sub->id,
                    'name' => $opt,
                    'slug' => $optSlug,
                    'is_active' => 1,
                    'show_in_pages' => $key,
                    'gender' => 'all'
                ]);
            }
        }
    }

    echo "Level 2 and Level 3 categories successfully seeded!\n";
} catch (\Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
