<?php

namespace Database\Seeders;

use App\Models\Product;
use App\Models\Category;
use App\Models\ProductVariant;
use App\Models\ProductImage;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        $productsData = [
            [
                'name' => "Demon Mask Embroidered Oversized Tee",
                'price' => 1299,
                'compare_price' => 1799,
                'category' => "Oversized T-Shirts",
                'tags' => ["OVERSIZED T-SHIRTS", "T-SHIRTS", "TRENDING", "NEW COLLECTIONS", "UNISEX"],
                'image' => "/images/products/demon_mask_tee.png",
                'desc' => "This oversized streetwear tee features a premium, thick embroidered Japanese Oni demon mask on the back. Made from heavy-weight 240 GSM organic cotton fabric to ensure both longevity and comfort.",
                'thumbnails' => [
                    "/images/products/demon_mask_tee.png",
                    "https://images.unsplash.com/photo-1578932750294-f5075e85f44a?q=80&w=600&auto=format&fit=crop",
                    "https://images.unsplash.com/photo-1605647540924-852290f6b0d5?q=80&w=600&auto=format&fit=crop"
                ]
            ],
            [
                'name' => "Chaos Anime Embroidered T-Shirt",
                'price' => 1199,
                'compare_price' => 1599,
                'category' => "Regular Fit T-Shirts",
                'tags' => ["REGULAR FIT T-SHIRTS", "T-SHIRTS", "TRENDING", "UNISEX"],
                'image' => "/images/products/chaos_anime_tee.png",
                'desc' => "Inspired by raw urban cyberpunk street style, this high-contrast white t-shirt boasts a fine-line black embroidered anime-style illustration on the back. Perfect for layering.",
                'thumbnails' => [
                    "/images/products/chaos_anime_tee.png",
                    "https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=600&auto=format&fit=crop",
                    "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=600&auto=format&fit=crop"
                ]
            ],
            [
                'name' => "Itachi Uchiha Embroidered T-Shirt",
                'price' => 1249,
                'compare_price' => 1699,
                'category' => "Oversized T-Shirts",
                'tags' => ["OVERSIZED T-SHIRTS", "T-SHIRTS", "NEW COLLECTIONS", "UNISEX"],
                'image' => "/images/products/itachi_uchiha_tee.png",
                'desc' => "Featuring the legendary red sharingan eyes and symbolic red clouds embroidered meticulously on the back. Heavy-weight black cotton streetwear fit with premium reinforcement stitches.",
                'thumbnails' => [
                    "/images/products/itachi_uchiha_tee.png",
                    "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=600&auto=format&fit=crop",
                    "https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=600&auto=format&fit=crop"
                ]
            ],
            [
                'name' => "Akatsuki Cloud Embroidered T-Shirt",
                'price' => 1099,
                'compare_price' => 1499,
                'category' => "Regular Fit T-Shirts",
                'tags' => ["REGULAR FIT T-SHIRTS", "T-SHIRTS", "UNISEX"],
                'image' => "/images/products/akatsuki_cloud_tee.png",
                'desc' => "A sleek, minimalist design featuring a small, clean red embroidered Akatsuki cloud on the left chest. Subtle styling with premium-grade embroidery thread for Naruto fans.",
                'thumbnails' => [
                    "/images/products/akatsuki_cloud_tee.png",
                    "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?q=80&w=600&auto=format&fit=crop",
                    "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=600&auto=format&fit=crop"
                ]
            ],
            [
                'name' => "Earth Moss Baggy Jeans",
                'price' => 2199,
                'compare_price' => 2999,
                'category' => "Jeans",
                'tags' => ["NEW COLLECTIONS", "TRENDING", "WOMEN"],
                'image' => "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?q=80&w=600&auto=format&fit=crop",
                'desc' => "Premium heavyweight denim utility jeans in earthy moss green. Relaxed baggy fit with multiple deep pockets, contrast stitches, and subtle brand embroidery on the back pocket.",
                'thumbnails' => [
                    "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?q=80&w=600&auto=format&fit=crop",
                    "https://images.unsplash.com/photo-1475180098004-ca77a66827ae?q=80&w=600&auto=format&fit=crop"
                ]
            ],
            [
                'name' => "Peach Haze Baggy Jeans",
                'price' => 2199,
                'compare_price' => 2999,
                'category' => "Jeans",
                'tags' => ["NEW COLLECTIONS", "TRENDING", "WOMEN"],
                'image' => "/images/products/peach_haze_jeans.png",
                'desc' => "Chic dusty peach baggy jeans crafted from 100% organic cotton denim. High-rise fit, reinforced belt loops, and premium custom embroidery detail.",
                'thumbnails' => [
                    "/images/products/peach_haze_jeans.png",
                    "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=600&auto=format&fit=crop"
                ]
            ],
            [
                'name' => "Tactical Olive Cargos",
                'price' => 2499,
                'compare_price' => 3299,
                'category' => "Cargos",
                'tags' => ["NEW COLLECTIONS", "MEN"],
                'image' => "https://images.unsplash.com/photo-1517423568366-8b83523034fd?q=80&w=600&auto=format&fit=crop",
                'desc' => "Heavy-duty ripstop utility cargos. Feature 6 pockets, adjustable drawstrings, and embroidered streetwear logo detail.",
                'thumbnails' => [
                    "https://images.unsplash.com/photo-1517423568366-8b83523034fd?q=80&w=600&auto=format&fit=crop"
                ]
            ],
            [
                'name' => "Sandstorm Multi-Pocket Cargos",
                'price' => 2499,
                'compare_price' => 3299,
                'category' => "Cargos",
                'tags' => ["NEW COLLECTIONS", "TRENDING", "UNISEX"],
                'image' => "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?q=80&w=600&auto=format&fit=crop",
                'desc' => "Desert sand utility pants with detailed knee panels, zip compartments, and signature branding embroidery.",
                'thumbnails' => [
                    "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?q=80&w=600&auto=format&fit=crop"
                ]
            ],
            [
                'name' => "Pleated Streetwear Skirt",
                'price' => 1499,
                'compare_price' => 1999,
                'category' => "Skirts",
                'tags' => ["NEW COLLECTIONS", "WOMEN"],
                'image' => "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=600&auto=format&fit=crop",
                'desc' => "High-waisted pleated tennis skirt featuring a custom embroidered logo along the hemline. Built-in inner shorts for all-day comfort.",
                'thumbnails' => [
                    "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=600&auto=format&fit=crop"
                ]
            ],
            [
                'name' => "Signature Comfort Boxers (Set of 3)",
                'price' => 899,
                'compare_price' => 1199,
                'category' => "Underwear",
                'tags' => ["NEW COLLECTIONS", "MEN"],
                'image' => "https://images.unsplash.com/photo-1582533561751-ef6f6ab93a2e?q=80&w=600&auto=format&fit=crop",
                'desc' => "Ultra-soft modal cotton underwear with premium elastic waistband and embroidered brand initials.",
                'thumbnails' => [
                    "https://images.unsplash.com/photo-1582533561751-ef6f6ab93a2e?q=80&w=600&auto=format&fit=crop"
                ]
            ],
            [
                'name' => "Cyberpunk Embroidered Button-Up Shirt",
                'price' => 1599,
                'compare_price' => 2199,
                'category' => "Shirts",
                'tags' => ["SHIRTS", "TRENDING", "NEW COLLECTIONS", "UNISEX"],
                'image' => "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=600&auto=format&fit=crop",
                'desc' => "Premium structure button-up streetwear shirt featuring detailed cyber-mesh logo embroidery on the collar and back. Heavyweight canvas-like feel.",
                'thumbnails' => [
                    "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=600&auto=format&fit=crop"
                ]
            ],
            [
                'name' => "Sakura Blossom Streetwear Sweatshirt",
                'price' => 1899,
                'compare_price' => 2499,
                'category' => "Sweatshirts",
                'tags' => ["SWEATSHIRTS", "NEW COLLECTIONS", "TRENDING", "UNISEX"],
                'image' => "https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=600&auto=format&fit=crop",
                'desc' => "Cozy custom pink and white sakura floral branches embroidered meticulously on a heavy black cotton blend sweatshirt.",
                'thumbnails' => [
                    "https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=600&auto=format&fit=crop"
                ]
            ]
        ];

        // 1. Create categories
        $categoriesMap = [];
        $categoryNames = collect($productsData)->pluck('category')->unique();
        
        foreach ($categoryNames as $catName) {
            $slug = Str::slug($catName);
            $category = Category::firstOrCreate(
                ['slug' => $slug],
                [
                    'name' => $catName,
                    'is_active' => true,
                    'is_featured' => true,
                ]
            );
            $categoriesMap[$catName] = $category->id;
        }

        // 2. Create products, variants, and images (only on a fresh database —
        //    never overwrite products on redeploys, admin edits would be lost)
        if (Product::count() > 0) {
            return;
        }

        foreach ($productsData as $data) {
            $slug = Str::slug($data['name']);
            
            // Delete product if it exists to avoid duplicate constraint errors
            Product::where('slug', $slug)->forceDelete();
            
            $product = Product::create([
                'name' => $data['name'],
                'slug' => $slug,
                'description' => $data['desc'],
                'short_description' => Str::limit($data['desc'], 150),
                'type' => 'simple',
                'status' => 'published',
                'is_featured' => true,
                'tags' => $data['tags']
            ]);

            // Sync Category
            if (isset($categoriesMap[$data['category']])) {
                $product->categories()->sync([$categoriesMap[$data['category']]]);
            }

            // Create Variants
            $sizes = ['S', 'M', 'L', 'XL'];
            foreach ($sizes as $idx => $size) {
                ProductVariant::create([
                    'product_id' => $product->id,
                    'sku' => strtoupper(explode(' ', $data['name'])[0]) . '-' . $size . '-' . rand(100, 999),
                    'price' => $data['price'],
                    'compare_price' => $data['compare_price'],
                    'stock' => rand(15, 60),
                    'is_active' => true,
                    'sort_order' => $idx,
                    'attributes' => ['size' => $size]
                ]);
            }

            // Create Images
            foreach ($data['thumbnails'] as $idx => $thumbUrl) {
                ProductImage::create([
                    'product_id' => $product->id,
                    'url' => $thumbUrl,
                    'is_primary' => $idx === 0,
                    'sort_order' => $idx,
                    'alt_text' => $data['name'] . ' Thumbnail ' . ($idx + 1)
                ]);
            }
        }

        // 3. Seed Default Banners if banners table is empty
        if (\App\Models\Banner::count() === 0) {
            $defaultBanners = [
                // Home Heros
                [
                    'title' => "Streetwear Crafted\nto Stand Out.",
                    'subtitle' => "Premium Embroidered",
                    'description' => "Our latest streetwear collection features heavyweight 240 GSM organic cotton t-shirts and hoodies, custom embroidered to perfection.",
                    'image_url' => "/images/hero_banner.png",
                    'link_url' => "#catalog",
                    'link_text' => "Shop Collection",
                    'position' => "home_hero",
                    'sort_order' => 0,
                    'is_active' => true
                ],
                [
                    'title' => "Artistry in\nEvery Stitch.",
                    'subtitle' => "Limited Edition",
                    'description' => "Explore fine-line high-density thread art designed by urban digital artists, exclusively created for the minimalist streetwear aesthetic.",
                    'image_url' => "https://images.unsplash.com/photo-1578932750294-f5075e85f44a?q=80&w=1400&auto=format&fit=crop",
                    'link_url' => "#catalog",
                    'link_text' => "Explore Drop",
                    'position' => "home_hero",
                    'sort_order' => 1,
                    'is_active' => true
                ],
                [
                    'title' => "Your Design,\nOur Craft.",
                    'subtitle' => "Custom Customs",
                    'description' => "Upload your sketches, anime artwork, or signature logo, and work with our professional stitchers to build your own premium custom fits.",
                    'image_url' => "https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=1400&auto=format&fit=crop",
                    'link_url' => "#catalog",
                    'link_text' => "Start Designing",
                    'position' => "home_hero",
                    'sort_order' => 2,
                    'is_active' => true
                ],
                // Page Heros
                [
                    'title' => "Your design, our premium craftsmanship.",
                    'subtitle' => "Custom Customs",
                    'description' => "Upload custom logos, sketches or text, and our embroidery specialists will recreate them on high-weight cotton styles.",
                    'image_url' => "https://images.unsplash.com/photo-1605647540924-852290f6b0d5?q=80&w=1200&auto=format&fit=crop",
                    'link_url' => "",
                    'link_text' => "Start Customizing",
                    'position' => "customization_hero",
                    'sort_order' => 0,
                    'is_active' => true
                ],
                [
                    'title' => "Heavyweight fabrics, high-density stitches.",
                    'subtitle' => "Premium Embroidered",
                    'description' => "Explore our collection of custom anime graphics, cyberpunk typography, and classic streetwear art embroidered to perfection.",
                    'image_url' => "/images/hero_banner.png",
                    'link_url' => "",
                    'link_text' => "Shop New Collection",
                    'position' => "embroidered_hero",
                    'sort_order' => 0,
                    'is_active' => true
                ],
                [
                    'title' => "Personalize anything instantly.",
                    'subtitle' => "Premium Stitched Patches",
                    'description' => "High-density collectible thread art patches with premium merrowed borders. Designed to be sewn or ironed onto bags, jackets, or denim.",
                    'image_url' => "https://images.unsplash.com/photo-1578932750294-f5075e85f44a?q=80&w=1200&auto=format&fit=crop",
                    'link_url' => "",
                    'link_text' => "View All Patches",
                    'position' => "patches_hero",
                    'sort_order' => 0,
                    'is_active' => true
                ],
                // Campaign
                [
                    'title' => "Fearless Stitches",
                    'subtitle' => "CAMPAIGN 2026",
                    'description' => "Built for durability, designed to stand out. Our latest collection challenges standard embroidery styles with thick, multi-layered 3D stitches.",
                    'image_url' => "https://images.unsplash.com/photo-1578932750294-f5075e85f44a?q=80&w=1000&auto=format&fit=crop",
                    'link_url' => "",
                    'link_text' => "Explore Campaign",
                    'position' => "campaign_embroidered",
                    'sort_order' => 0,
                    'is_active' => true
                ],
                // Instagram Feed
                [
                    'title' => "#INDIUNA",
                    'image_url' => "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=600&auto=format&fit=crop",
                    'position' => "instagram_gallery",
                    'sort_order' => 0,
                    'is_active' => true
                ],
                [
                    'title' => "#STREETWEAR",
                    'image_url' => "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=600&auto=format&fit=crop",
                    'position' => "instagram_gallery",
                    'sort_order' => 1,
                    'is_active' => true
                ],
                [
                    'title' => "#EMBROIDERY",
                    'image_url' => "https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=600&auto=format&fit=crop",
                    'position' => "instagram_gallery",
                    'sort_order' => 2,
                    'is_active' => true
                ],
                [
                    'title' => "#CHAOS",
                    'image_url' => "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?q=80&w=600&auto=format&fit=crop",
                    'position' => "instagram_gallery",
                    'sort_order' => 3,
                    'is_active' => true
                ],
                [
                    'title' => "#OVERSIZED",
                    'image_url' => "https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=600&auto=format&fit=crop",
                    'position' => "instagram_gallery",
                    'sort_order' => 4,
                    'is_active' => true
                ],
                [
                    'title' => "#STYLE",
                    'image_url' => "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=600&auto=format&fit=crop",
                    'position' => "instagram_gallery",
                    'sort_order' => 5,
                    'is_active' => true
                ]
            ];

            foreach ($defaultBanners as $banner) {
                \App\Models\Banner::create($banner);
            }
        }

        // 4. Update categories with default images & redirects
        $categoryConfig = [
            'Oversized T-Shirts' => [
                'image' => 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=600&auto=format&fit=crop',
                'redirect_to' => 'category:Oversized T-Shirts',
                'show_in_pages' => 'home,customization,embroidered,patches'
            ],
            'Regular Fit T-Shirts' => [
                'image' => 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?q=80&w=600&auto=format&fit=crop',
                'redirect_to' => 'category:Regular Fit T-Shirts',
                'show_in_pages' => 'home,customization,embroidered,patches'
            ],
            'Jeans' => [
                'image' => 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?q=80&w=600&auto=format&fit=crop',
                'redirect_to' => 'category:Jeans',
                'show_in_pages' => 'home,customization,embroidered,patches'
            ],
            'Cargos' => [
                'image' => 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?q=80&w=600&auto=format&fit=crop',
                'redirect_to' => 'category:Cargos',
                'show_in_pages' => 'home,customization,embroidered,patches'
            ],
            'Skirts' => [
                'image' => 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=600&auto=format&fit=crop',
                'redirect_to' => 'category:Skirts',
                'show_in_pages' => 'home,customization,embroidered,patches'
            ],
            'Sweatshirts' => [
                'image' => 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=600&auto=format&fit=crop',
                'redirect_to' => 'category:Sweatshirts',
                'show_in_pages' => 'home,customization,embroidered,patches'
            ]
        ];

        foreach ($categoryConfig as $catName => $config) {
            $cat = Category::where('name', $catName)->first();
            if ($cat) {
                $cat->update($config);
            }
        }

        // 5. Seed default trending and new arrival settings
        $allProductsList = Product::all();
        if ($allProductsList->count() >= 4) {
            $trendingIds = $allProductsList->slice(0, 4)->pluck('id')->join(',');
            $newArrivalIds = $allProductsList->slice(2, 4)->pluck('id')->join(',');

            // Save settings via eloquent
            $settingsData = [
                'trending_products' => $trendingIds,
                'new_arrivals' => $newArrivalIds
            ];

            foreach ($settingsData as $key => $value) {
                $setting = \App\Models\Setting::where('key', $key)->first();
                if ($setting) {
                    $setting->update(['value' => $value]);
                } else {
                    \App\Models\Setting::create([
                        'group' => 'general',
                        'key' => $key,
                        'value' => $value,
                        'type' => 'string',
                        'is_public' => true
                    ]);
                }
            }
        }
    }
}
