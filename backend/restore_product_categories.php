<?php

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Product;
use App\Models\Category;

try {
    if (Category::count() > 0) {
        echo "Categories already exist. Skipping restore_product_categories.php to prevent overwriting existing category/product associations.\n";
        return;
    }

    $categories = Category::all();

    $findCatByName = function($name) use ($categories) {
        return $categories->first(function($c) use ($name) {
            return strtolower($c->name) === strtolower($name);
        });
    };

    $restoredCount = 0;
    foreach (Product::all() as $p) {
        $name = strtolower($p->name);

        // 1. Map to Level 2 Subcategory
        $subCat = null;
        if (str_contains($name, 'logo')) {
            $subCat = $findCatByName('LOGO embroidery');
        } elseif (str_contains($name, 'portrait')) {
            $subCat = $findCatByName('portrait embroidery');
        } elseif (str_contains($name, 'pet')) {
            $subCat = $findCatByName('pet embroidery');
        } elseif (str_contains($name, 'vehicle') || str_contains($name, 'bike') || str_contains($name, 'car')) {
            $subCat = $findCatByName('vechicle embroidery');
        } elseif (str_contains($name, 'customise') || str_contains($name, 'photo')) {
            $subCat = $findCatByName('CUSTOMIZE Embroidery');
        } elseif (str_contains($name, 'anime') || str_contains($name, 'naruto') || str_contains($name, 'spiderman') || str_contains($name, 'marvel') || str_contains($name, 'spidey') || str_contains($name, 'villain')) {
            $subCat = $findCatByName('Anime Universe');
        } elseif (str_contains($name, 'sunset') || str_contains($name, 'palm') || str_contains($name, 'luxury')) {
            $subCat = $findCatByName('Luxury Zone');
        } elseif (str_contains($name, 'tropical') || str_contains($name, 'tripi') || str_contains($name, 'airplane') || str_contains($name, 'travel')) {
            $subCat = $findCatByName('Travel Series');
        } elseif (str_contains($name, 'wave') || str_contains($name, 'ocean') || str_contains($name, 'nature')) {
            $subCat = $findCatByName('Nature Studio');
        } elseif (str_contains($name, 'hanuman') || str_contains($name, 'ganesh') || str_contains($name, 'shree') || str_contains($name, 'karma') || str_contains($name, 'spiritual') || str_contains($name, 'veer') || str_contains($name, 'shree')) {
            $subCat = $findCatByName('Spiritual Heritage');
        } elseif (str_contains($name, 'jawan') || str_contains($name, 'amar')) {
            $subCat = $findCatByName('National Prides');
        } elseif (str_contains($name, 'keychain')) {
            $subCat = $findCatByName('keychain patches');
        } elseif (str_contains($name, 'sew-on') || str_contains($name, 'sew on')) {
            $subCat = $findCatByName('Sew on patches');
        } elseif (str_contains($name, 'magnetic')) {
            $subCat = $findCatByName('magnetic patches');
        } elseif (str_contains($name, 'iron-on') || str_contains($name, 'iron on') || str_contains($name, 'patch')) {
            $subCat = $findCatByName('Iron on patches');
        }

        if ($subCat) {
            // Sync to the Level 2 Category
            $p->categories()->sync([$subCat->id]);

            // Save the fit option inside tags
            $fitOption = null;
            if (str_contains($name, 'oversized') || str_contains($name, 'over size')) {
                $fitOption = 'Oversized T-Shirts';
            } elseif (str_contains($name, 'hoodie')) {
                $fitOption = 'Hoodies';
            } elseif (str_contains($name, 'sweatshirt')) {
                $fitOption = 'Sweatshirts';
            } else {
                $fitOption = 'Regular Fit';
            }

            if ($fitOption) {
                $p->tags = [$fitOption];
            }
            $p->save();
            $restoredCount++;
        }
    }

    echo "Successfully mapped and restored category associations + tags for {$restoredCount} products!\n";
} catch (\Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
