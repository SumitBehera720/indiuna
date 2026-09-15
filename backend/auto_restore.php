<?php

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Category;
use App\Models\Product;

try {
    if (Category::count() > 0) {
        echo "Categories already exist. Skipping auto_restore.php to prevent overwriting existing data.\n";
        return;
    }

    $dir = __DIR__ . '/storage/app/public/media/general';
    if (!is_dir($dir)) {
        echo "Error: Media directory not found: $dir\n";
        exit(1);
    }

    $files = scandir($dir);
    $files = array_filter($files, function($f) {
        return $f !== '.' && $f !== '..';
    });

    $categories = Category::all();
    echo "Scanning " . count($files) . " files for " . count($categories) . " categories...\n";

    // Helper to find latest file matching a keyword
    $findLatestFile = function($keyword) use ($dir, $files) {
        $matches = [];
        foreach ($files as $file) {
            if (str_contains(strtolower($file), strtolower($keyword))) {
                $filePath = "$dir/$file";
                $mtime = filemtime($filePath);
                
                // Also parse timestamp from filename if available (e.g., logo-1787034867.webp)
                $time = $mtime;
                if (preg_match('/-(\d+)\.(webp|png|jpg|jpeg)$/i', $file, $m)) {
                    $time = (int) $m[1];
                }
                
                $matches[] = [
                    'name' => $file,
                    'time' => $time
                ];
            }
        }
        
        if (empty($matches)) {
            return null;
        }
        
        // Sort matches by time descending
        usort($matches, function($a, $b) {
            return $b['time'] - $a['time'];
        });
        
        return $matches[0]['name'];
    };

    // Keyword mapping for categories
    $catKeywords = [
        'LOGO embroidery' => 'logo',
        'CUSTOMIZE Embroidery' => 'customise',
        'pet embroidery' => 'pet',
        'vechicle embroidery' => 'vehicle',
        'portrait embroidery' => 'potrait', // matching potrait typo
        'Anime Universe' => 'anime',
        'Festive Collection' => 'festive',
        'IndiUna Signature' => 'signature',
        'Limited Edition' => 'limited',
        'Luxury Zone' => 'luxury',
        'National Prides' => 'national',
        'Nature Studio' => 'nature',
        'Spiritual Heritage' => 'spiritual',
        'Travel Series' => 'travel',
        'Urban Culture' => 'urban',
        'Iron on patches' => 'iron',
        'keychain patches' => 'keychain',
        'magnetic patches' => 'magnetic',
        'Sew on patches' => 'sew'
    ];

    $restoredCatsCount = 0;
    foreach ($categories as $cat) {
        // Skip root categories which have preset cover images or are CUSTOMIZATION, EMBROIDERED APPAREL, PATCHES
        if (in_array($cat->name, ['CUSTOMIZATION', 'EMBROIDERED APPAREL', 'PATCHES'])) {
            continue;
        }

        $keyword = $catKeywords[$cat->name] ?? null;
        if ($keyword) {
            $latestFile = $findLatestFile($keyword);
            if ($latestFile) {
                // Save path as relative to storage disk root
                $cat->image = "/media/general/$latestFile";
                $cat->save();
                echo "Restored category '{$cat->name}' with image: {$cat->image}\n";
                $restoredCatsCount++;
            } else {
                echo "No image file found for category keyword '{$keyword}' ('{$cat->name}')\n";
            }
        }
    }
    echo "Restored cover images for {$restoredCatsCount} categories.\n\n";

    // 2. Link the 11 unlinked products to their correct subcategories
    echo "Restoring associations for unlinked products...\n";
    $findCatByName = function($name) use ($categories) {
        return $categories->first(function($c) use ($name) {
            return strtolower($c->name) === strtolower($name);
        });
    };

    $unlinkedProducts = Product::all()->filter(function($p) {
        return $p->categories->count() === 0;
    });

    $restoredProductsCount = 0;
    foreach ($unlinkedProducts as $p) {
        $name = strtolower($p->name);
        $subCat = null;
        $fitOption = 'Regular Fit';

        if (str_contains($name, 'baby with father') || str_contains($name, 'two hands thread') || str_contains($name, 'art work into') || str_contains($name, 'heart shape')) {
            $subCat = $findCatByName('CUSTOMIZE Embroidery');
        } elseif (str_contains($name, 'tea-riffic')) {
            $subCat = $findCatByName('IndiUna Signature');
        } else {
            // Default fallback
            $subCat = $findCatByName('CUSTOMIZE Embroidery');
        }

        // Fit Type tag logic
        if (str_contains($name, 'oversized') || str_contains($name, 'over size') || str_contains($name, 't-shirt')) {
            $fitOption = 'Oversized T-Shirts';
        } elseif (str_contains($name, 'hoodie')) {
            $fitOption = 'Hoodies';
        } elseif (str_contains($name, 'sweatshirt')) {
            $fitOption = 'Sweatshirts';
        }

        if ($subCat) {
            $p->categories()->sync([$subCat->id]);
            $p->tags = [$fitOption];
            $p->save();
            echo "Linked product '{$p->name}' to category '{$subCat->name}' with tag '{$fitOption}'\n";
            $restoredProductsCount++;
        }
    }
    echo "Successfully linked {$restoredProductsCount} products!\n";

} catch (\Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
