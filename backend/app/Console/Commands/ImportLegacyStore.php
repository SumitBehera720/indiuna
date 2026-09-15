<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Models\Brand;
use App\Models\Category;
use App\Models\Customer;
use App\Models\CustomerAddress;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\Review;
use App\Models\Setting;
use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Spatie\Permission\Models\Role;

class ImportLegacyStore extends Command
{
    protected $signature = 'indiuna:import-legacy
                            {--dump= : Path to the legacy WordPress/WooCommerce MySQL dump (.sql.gz)}
                            {--no-wipe : Keep existing products/categories/brands instead of replacing them}';

    protected $description = 'Import products, categories, brand, users, customers and product reviews from the old WooCommerce store dump into the INDIUNA schema';

    private const MIN_LEGACY_PRODUCT_ID = 1000123;

    private const TARGET_TABLES = [
        'wp_posts',
        'wp_postmeta',
        'wp_users',
        'wp_usermeta',
        'wp_terms',
        'wp_term_taxonomy',
        'wp_term_relationships',
        'wp_comments',
        'wp_commentmeta',
    ];

    public function handle(): int
    {
        $dump = $this->option('dump') ?: storage_path('app/import/legacy-store.sql.gz');

        if (!is_file($dump)) {
            $this->error("Dump not found: {$dump}");
            $this->error('Upload the .sql.gz dump (e.g. to storage/app/import/legacy-store.sql.gz) and re-run.');

            return self::FAILURE;
        }

        $parsed = $this->parse($dump);
        $rows = $parsed['rows'];

        $this->info('Parsed dump:');
        foreach (self::TARGET_TABLES as $table) {
            $count = count($rows[$table] ?? []);
            $this->line('  ' . $table . ': ' . $count . ' rows');
        }

        $postMeta = $this->indexMeta($rows['wp_postmeta'] ?? [], 'post_id');
        $userMeta = $this->indexMeta($rows['wp_usermeta'] ?? [], 'user_id');
        $commentMeta = $this->indexMeta($rows['wp_commentmeta'] ?? [], 'comment_id');

        $termNames = [];
        foreach ($rows['wp_terms'] ?? [] as $term) {
            $termNames[$term['term_id']] = $term['name'];
        }

        $termTax = [];
        foreach ($rows['wp_term_taxonomy'] ?? [] as $tt) {
            $termTax[$tt['term_taxonomy_id']] = [
                'taxonomy' => $tt['taxonomy'],
                'term_id' => $tt['term_id'],
            ];
        }

        $relationships = [];
        foreach ($rows['wp_term_relationships'] ?? [] as $rel) {
            $relationships[$rel['object_id']][] = $rel['term_taxonomy_id'];
        }

        $posts = [];
        foreach ($rows['wp_posts'] ?? [] as $post) {
            $posts[$post['ID']] = $post;
        }

        DB::beginTransaction();

        try {
            $this->wipeExistingCatalog();

            [$categoryMap, $brandMap, $tagMap] = $this->importTaxonomy($termTax, $termNames);

            $productIds = $this->importProducts($posts, $postMeta, $relationships, $termTax, $categoryMap, $brandMap, $tagMap);

            $auth = $this->importUsers($rows['wp_users'] ?? [], $userMeta);

            $this->importReviews($rows['wp_comments'] ?? [], $commentMeta, $auth['customerByEmail']);

            $this->updateHomepageSettings($productIds);

            DB::commit();
        } catch (\Throwable $e) {
            DB::rollBack();
            $this->error('Import failed and was rolled back: ' . $e->getMessage());
            $this->error($e->getTraceAsString());

            return self::FAILURE;
        }

        $this->printSummary($productIds, $categoryMap, $brandMap, $auth);

        return self::SUCCESS;
    }

    private function parse(string $file): array
    {
        $cols = [];
        $rows = [];
        $f = gzopen($file, 'rb');
        $inCreate = false;
        $ft = null;
        $t = null;
        $buf = '';
        $inS = false;

        while (!feof($f)) {
            $l = fgets($f);

            if ($inCreate) {
                if (preg_match('/^\s+`([A-Za-z_][A-Za-z0-9_]*)`/', $l, $m)) {
                    $cols[$ft][] = $m[1];
                }
                if (strpos($l, ') ENGINE=') !== false) {
                    $inCreate = false;
                }
                continue;
            }

            if (preg_match('/CREATE TABLE `([A-Za-z0-9_]+)`/', $l, $m)) {
                $ft = $m[1];
                $cols[$ft] = [];
                $inCreate = true;
                continue;
            }

            $len = strlen($l);
            for ($i = 0; $i < $len; $i++) {
                $ch = $l[$i];
                if ($inS) {
                    if ($ch === '\\') {
                        $i++;
                    } elseif ($ch === "'") {
                        $inS = false;
                    }
                } else {
                    if ($ch === "'") {
                        $inS = true;
                    }
                }
            }

            if (strpos($l, 'INSERT INTO ') !== false) {
                if (strlen(trim($buf)) > 0 && $t !== null) {
                    $this->collect($t, $buf, $cols, $rows);
                }
                $buf = '';
                if (preg_match('/INSERT INTO `([A-Za-z0-9_]+)/', $l, $m)) {
                    $t = $m[1];
                }
                $pos = strpos($l, 'VALUES');
                $buf = $pos !== false ? substr($l, $pos + 6) : '';
            } elseif ($t !== null) {
                $buf .= $l;
            }

            if ($t !== null && strlen(trim($buf)) > 0 && substr(rtrim($buf), -1) === ';' && !$inS) {
                $this->collect($t, $buf, $cols, $rows);
                $t = null;
                $buf = '';
            }
        }

        gzclose($f);

        return ['cols' => $cols, 'rows' => $rows];
    }

    private function collect(string $table, string $payload, array $cols, array &$rows): void
    {
        if (!in_array($table, self::TARGET_TABLES, true)) {
            return;
        }

        $columnNames = $cols[$table] ?? [];
        $flipped = array_flip($columnNames);
        $tuples = $this->splitRows($payload);

        foreach ($tuples as $tuple) {
            $fields = $this->splitCols($tuple);
            $row = [];
            foreach ($flipped as $name => $position) {
                $row[$name] = isset($fields[$position]) ? $fields[$position] : '';
            }
            $rows[$table][] = $row;
        }
    }

    private function splitRows(string $payload): array
    {
        $out = [];
        $cur = '';
        $depth = 0;
        $in = false;
        $esc = false;
        $n = strlen($payload);

        for ($i = 0; $i < $n; $i++) {
            $ch = $payload[$i];

            if ($esc) {
                if ($ch === 'n') {
                    $cur .= "\n";
                } elseif ($ch === 't') {
                    $cur .= "\t";
                } elseif ($ch === 'r') {
                    $cur .= "\r";
                } else {
                    $cur .= $ch;
                }
                $esc = false;
                continue;
            }

            if ($ch === '\\') {
                $esc = true;
                continue;
            }

            if ($in) {
                if ($ch === "'") {
                    $in = false;
                }
                $cur .= $ch;
                continue;
            }

            if ($ch === "'") {
                $in = true;
                $cur .= $ch;
                continue;
            }

            if ($ch === '(') {
                $depth++;
                $cur = '';
                continue;
            }

            if ($ch === ')') {
                $depth--;
                if ($depth === 0) {
                    $out[] = $cur;
                    $cur = '';
                }
                continue;
            }

            if ($depth > 0) {
                $cur .= $ch;
            }
        }

        while (isset($out[0]) && $out[0] === '') {
            array_shift($out);
        }

        return $out;
    }

    private function splitCols(string $tuple): array
    {
        $out = [];
        $cur = '';
        $in = false;
        $esc = false;
        $n = strlen($tuple);

        for ($i = 0; $i < $n; $i++) {
            $ch = $tuple[$i];

            if ($esc) {
                $cur .= $ch;
                $esc = false;
                continue;
            }

            if ($ch === '\\') {
                $esc = true;
                $cur .= $ch;
                continue;
            }

            if ($in) {
                if ($ch === "'") {
                    $in = false;
                }
                $cur .= $ch;
                continue;
            }

            if ($ch === "'") {
                $in = true;
                $cur .= $ch;
                continue;
            }

            if ($ch === ',') {
                $out[] = $cur;
                $cur = '';
                continue;
            }

            if ($ch === '(' || $ch === ')') {
                continue;
            }

            $cur .= $ch;
        }

        $out[] = $cur;

        foreach ($out as $key => &$value) {
            $len = strlen($value);
            if ($len >= 2 && $value[0] === "'" && $value[$len - 1] === "'") {
                $value = substr($value, 1, -1);
            }
        }
        unset($value);

        return $out;
    }

    private function indexMeta(array $metaRows, string $idColumn): array
    {
        $indexed = [];
        foreach ($metaRows as $row) {
            $indexed[$row[$idColumn]][$row['meta_key']] = $row['meta_value'];
        }

        return $indexed;
    }

    private function wipeExistingCatalog(): void
    {
        if ($this->option('no-wipe')) {
            return;
        }

        Product::withTrashed()->forceDelete();
        Category::withTrashed()->forceDelete();
        Brand::withTrashed()->forceDelete();
        $this->info('Removed existing products, categories and brands.');
    }

    private function termsTax(int|string $objectId, string $taxonomy, array $relations, array $termTax): array
    {
        $objectId = (string) $objectId;
        $ids = [];
        foreach ($relations[$objectId] ?? [] as $ttId) {
            $tt = $termTax[$ttId] ?? null;
            if ($tt && $tt['taxonomy'] === $taxonomy) {
                $ids[] = $tt['term_id'];
            }
        }

        return $ids;
    }

    private function importTaxonomy(array $termTax, array $termNames): array
    {
        $categoryMap = [];
        $brandMap = [];
        $tagMap = [];

        foreach ($termTax as $tt) {
            $termId = $tt['term_id'];
            $name = isset($termNames[$termId]) ? trim($termNames[$termId]) : '';
            if ($name === '') {
                continue;
            }

            if ($tt['taxonomy'] === 'product_cat') {
                $category = Category::firstOrCreate(
                    ['slug' => Str::slug($name)],
                    [
                        'name' => $name,
                        'is_active' => true,
                        'is_featured' => true,
                        'redirect_to' => 'category:' . $name,
                        'show_in_pages' => 'home,customization,embroidered,patches',
                    ]
                );
                $categoryMap[$termId] = $category->id;
            } elseif ($tt['taxonomy'] === 'product_brand') {
                $brand = Brand::firstOrCreate(
                    ['slug' => Str::slug($name)],
                    [
                        'name' => $name,
                        'is_active' => true,
                    ]
                );
                $brandMap[$termId] = $brand->id;
            } elseif ($tt['taxonomy'] === 'product_tag') {
                $tagMap[$termId] = $name;
            }
        }

        $this->info('Categories: ' . count($categoryMap) . ', Brands: ' . count($brandMap) . ', Tags: ' . count($tagMap));

        return [$categoryMap, $brandMap, $tagMap];
    }

    private function importProducts(array $posts, array $postMeta, array $relations, array $termTax, array $categoryMap, array $brandMap, array $tagMap): array
    {
        $productIds = [];

        foreach ($posts as $postId => $post) {
            if ($post['post_type'] !== 'product' || $post['post_status'] !== 'publish') {
                continue;
            }
            if ((int) $postId < self::MIN_LEGACY_PRODUCT_ID) {
                continue;
            }

            $name = trim($post['post_title']);
            if ($name === '') {
                continue;
            }

            $slug = trim($post['post_name']) !== '' ? $post['post_name'] : Str::slug($name);
            $slug = $this->uniqueSlug($slug);

            $meta = $postMeta[$postId] ?? [];
            $regular = (float) ($meta['_regular_price'] ?? 0);
            $price = (float) ($meta['_price'] ?? $regular);
            $manageStock = (($meta['_manage_stock'] ?? 'no') === 'yes');
            $stock = isset($meta['_stock']) && $meta['_stock'] !== '' ? (int) $meta['_stock'] : 0;

            $categoryIds = [];
            foreach ($this->termsTax($postId, 'product_cat', $relations, $termTax) as $termId) {
                if (isset($categoryMap[$termId])) {
                    $categoryIds[] = $categoryMap[$termId];
                }
            }

            $brandId = null;
            foreach ($this->termsTax($postId, 'product_brand', $relations, $termTax) as $termId) {
                if (isset($brandMap[$termId])) {
                    $brandId = $brandMap[$termId];
                    break;
                }
            }

            $tags = [];
            foreach ($this->termsTax($postId, 'product_tag', $relations, $termTax) as $termId) {
                if (isset($tagMap[$termId])) {
                    $tags[] = strtoupper($tagMap[$termId]);
                }
            }

            $description = $this->cleanDescription((string) ($post['post_content'] ?? ''));
            $short = trim((string) ($post['post_excerpt'] ?? ''));
            if ($short === '') {
                $short = Str::limit($description, 150);
            }

            $publishedAt = null;
            if (!empty($post['post_date']) && $post['post_date'] !== '0000-00-00 00:00:00') {
                $publishedAt = $post['post_date'];
            }

            $product = Product::create([
                'name' => $name,
                'slug' => $slug,
                'brand_id' => $brandId,
                'short_description' => $short ?: null,
                'description' => $description ?: null,
                'type' => 'simple',
                'status' => 'published',
                'tags' => $tags,
                'is_featured' => false,
                'published_at' => $publishedAt,
                'meta_data' => ['legacy_id' => (int) $postId],
            ]);

            if ($categoryIds) {
                $product->categories()->sync($categoryIds);
            }

            $sku = trim((string) ($meta['_sku'] ?? ''));
            if ($sku === '' || strtoupper($sku) === 'N/A') {
                $sku = 'INDIUNA-' . $postId;
            }
            $sku = $this->uniqueSku($sku);

            ProductVariant::create([
                'product_id' => $product->id,
                'sku' => $sku,
                'price' => $price > 0 ? $price : 0,
                'compare_price' => $regular > $price ? $regular : null,
                'stock' => $manageStock ? $stock : 0,
                'low_stock_threshold' => 5,
                'is_physical' => true,
                'is_tracked' => $manageStock,
                'is_active' => true,
                'sort_order' => 0,
            ]);

            $productIds[] = $product->id;
        }

        $this->info('Products imported: ' . count($productIds));

        return $productIds;
    }

    private function cleanDescription(string $html): string
    {
        $html = preg_replace('/\[[^\]]*\]/', '', $html);
        $html = preg_replace('#https?://(www\.)?indiuna\.com/wp-content[^\s"\'<]*#i', '', $html);
        $text = html_entity_decode(strip_tags($html), ENT_QUOTES | ENT_HTML5, 'UTF-8');
        $text = preg_replace('/[ \t]+/', ' ', $text);
        $text = preg_replace('/\n{3,}/', "\n\n", $text);

        return trim($text);
    }

    private function uniqueSlug(string $slug): string
    {
        $base = $slug;
        $counter = 2;
        while (Product::where('slug', $slug)->exists()) {
            $slug = $base . '-' . $counter;
            $counter++;
        }

        return $slug;
    }

    private function uniqueSku(string $sku): string
    {
        $base = $sku;
        $counter = 2;
        while (ProductVariant::where('sku', $sku)->exists()) {
            $sku = $base . '-' . $counter;
            $counter++;
        }

        return $sku;
    }

    private function importUsers(array $users, array $userMeta): array
    {
        $customerByEmail = [];
        $passwords = [];

        foreach ($users as $user) {
            $login = $user['user_login'];
            $email = trim($user['user_email']);
            if ($email === '') {
                continue;
            }

            $capabilities = $userMeta[$user['ID']]['wp_capabilities'] ?? '';
            $isAdmin = str_contains($capabilities, 'administrator');
            $isCustomer = str_contains($capabilities, 'customer');

            if (!$isAdmin && !$isCustomer) {
                continue;
            }

            $display = trim($user['display_name'] ?? '');
            if ($display === '') {
                $display = $login;
            }
            [$first, $last] = $this->splitName($display);

            $existing = User::where('email', $email)->exists();

            $attributes = [
                'first_name' => $first,
                'last_name' => $last,
                'phone' => $userMeta[$user['ID']]['billing_phone'] ?? null,
                'is_active' => true,
                'email_verified_at' => now(),
            ];

            $tempPassword = null;
            if (!$existing) {
                $tempPassword = Str::password(14);
                $attributes['password'] = $tempPassword;
            }

            $dbUser = User::firstOrCreate(['email' => $email], $attributes);

            $passwordLabel = $existing ? 'unchanged (user already existed)' : $tempPassword;

            if ($isAdmin) {
                $role = Role::firstOrCreate(['name' => 'super_admin', 'guard_name' => 'web']);
                $dbUser->assignRole($role);
                $passwords[] = ['role' => 'admin', 'email' => $email, 'login' => $login, 'password' => $passwordLabel];
                continue;
            }

            $this->createCustomer($dbUser, $user, $userMeta);
            $customerByEmail[$email] = $dbUser->id;

            $passwords[] = ['role' => 'customer', 'email' => $email, 'login' => $login, 'password' => $passwordLabel];
        }

        return ['customerByEmail' => $customerByEmail, 'passwords' => $passwords];
    }

    private function splitName(string $display): array
    {
        $parts = preg_split('/\s+/', trim($display));
        $first = $parts[0] ?? '';
        $last = count($parts) > 1 ? implode(' ', array_slice($parts, 1)) : '';

        return [$first === '' ? 'Legacy' : $first, $last === '' ? 'Customer' : $last];
    }

    private function createCustomer(User $user, array $wpUser, array $userMeta): Customer
    {
        $meta = $userMeta[$wpUser['ID']] ?? [];
        $email = trim($wpUser['user_email']);
        $first = $meta['billing_first_name'] ?? $user->first_name;
        $last = $meta['billing_last_name'] ?? $user->last_name;

        $customer = Customer::firstOrCreate(
            ['email' => $email],
            [
                'user_id' => $user->id,
                'first_name' => $first,
                'last_name' => $last,
                'phone' => $meta['billing_phone'] ?? null,
                'is_active' => true,
                'is_verified' => true,
            ]
        );

        $this->importAddresses($customer, $meta);

        return $customer;
    }

    private function importAddresses(Customer $customer, array $meta): void
    {
        $billing = $this->addressFromMeta($meta, 'billing', $customer);
        $shipping = $this->addressFromMeta($meta, 'shipping', $customer);

        if (!$billing && !$shipping) {
            return;
        }

        if ($billing) {
            $billing['type'] = $shipping && $this->sameAddress($billing, $shipping) ? 'both' : 'billing';
            $billing['is_default'] = true;
            CustomerAddress::firstOrCreate(
                ['customer_id' => $billing['customer_id'], 'type' => $billing['type'], 'address_line1' => $billing['address_line1']],
                $billing
            );
        }

        if ($shipping && !$this->sameAddress($shipping, $billing ?? [])) {
            $shipping['type'] = 'shipping';
            CustomerAddress::firstOrCreate(
                ['customer_id' => $shipping['customer_id'], 'type' => 'shipping', 'address_line1' => $shipping['address_line1']],
                $shipping
            );
        }
    }

    private function sameAddress(array $a, array $b): bool
    {
        if (!$b) {
            return false;
        }

        $fields = ['first_name', 'last_name', 'address_line1', 'address_line2', 'city', 'state', 'postal_code', 'country', 'phone'];
        foreach ($fields as $field) {
            if ((string) ($a[$field] ?? '') !== (string) ($b[$field] ?? '')) {
                return false;
            }
        }

        return true;
    }

    private function addressFromMeta(array $meta, string $prefix, Customer $customer): ?array
    {
        $address1 = trim((string) ($meta[$prefix . '_address_1'] ?? ''));
        $city = trim((string) ($meta[$prefix . '_city'] ?? ''));
        $postal = trim((string) ($meta[$prefix . '_postcode'] ?? ''));

        if ($address1 === '' && $city === '' && $postal === '') {
            return null;
        }

        return [
            'customer_id' => $customer->id,
            'first_name' => trim((string) ($meta[$prefix . '_first_name'] ?? '')) ?: $customer->first_name,
            'last_name' => trim((string) ($meta[$prefix . '_last_name'] ?? '')) ?: $customer->last_name,
            'address_line1' => $address1,
            'address_line2' => trim((string) ($meta[$prefix . '_address_2'] ?? '')) ?: null,
            'city' => $city ?: 'N/A',
            'state' => trim((string) ($meta[$prefix . '_state'] ?? '')) ?: 'N/A',
            'postal_code' => $postal ?: '000000',
            'country' => $this->countryName((string) ($meta[$prefix . '_country'] ?? 'IN')),
            'phone' => trim((string) ($meta[$prefix . '_phone'] ?? '')) ?: null,
        ];
    }

    private function countryName(string $code): string
    {
        return strtoupper($code) === 'IN' ? 'India' : ($code ?: 'India');
    }

    private function importReviews(array $comments, array $commentMeta, array $customerByEmail): void
    {
        $imported = 0;

        foreach ($comments as $comment) {
            if ($comment['comment_type'] !== 'review' || (string) $comment['comment_approved'] !== '1') {
                continue;
            }

            $product = Product::where('meta_data->legacy_id', (int) $comment['comment_post_ID'])->first();
            if (!$product) {
                continue;
            }

            $authorEmail = trim($comment['comment_author_email'] ?? '');
            $authorName = trim($comment['comment_author'] ?? '');
            if ($authorName === '') {
                $authorName = 'Customer';
            }

            $customer = null;
            if ($authorEmail !== '' && isset($customerByEmail[$authorEmail])) {
                $customer = Customer::where('user_id', $customerByEmail[$authorEmail])->first();
            }

            if (!$customer) {
                [$first, $last] = $this->splitName($authorName);
                $customer = Customer::firstOrCreate(
                    ['email' => $authorEmail !== '' ? $authorEmail : 'review@legacy.invalid'],
                    [
                        'first_name' => $first,
                        'last_name' => $last,
                        'is_active' => true,
                        'is_verified' => false,
                    ]
                );
            }

            $rating = (int) ($commentMeta[$comment['comment_ID']]['rating'] ?? 5);
            if ($rating < 1 || $rating > 5) {
                $rating = 5;
            }

            $exists = Review::where('product_id', $product->id)
                ->where('customer_id', $customer->id)
                ->exists();

            if (!$exists) {
                Review::create([
                    'product_id' => $product->id,
                    'customer_id' => $customer->id,
                    'rating' => $rating,
                    'content' => $this->cleanReview($comment['comment_content'] ?? ''),
                    'is_approved' => true,
                    'approved_at' => !empty($comment['comment_date']) ? $comment['comment_date'] : now(),
                ]);

                $imported++;
            }
        }

        $this->info('Reviews imported: ' . $imported);
    }

    private function cleanReview(string $text): string
    {
        return trim(html_entity_decode(strip_tags($text), ENT_QUOTES | ENT_HTML5, 'UTF-8'));
    }

    private function updateHomepageSettings(array $productIds): void
    {
        if (count($productIds) < 4) {
            $this->warn('Fewer than 4 products imported — leaving trending/new-arrivals settings unchanged.');

            return;
        }

        $trending = array_slice($productIds, 0, 4);
        $newArrivals = array_slice($productIds, 2, 4);

        foreach (['trending_products' => $trending, 'new_arrivals' => $newArrivals] as $key => $ids) {
            Setting::updateOrCreate(
                ['key' => $key],
                ['group' => 'general', 'value' => implode(',', $ids), 'type' => 'string', 'is_public' => true]
            );
        }

        $this->info('Updated homepage trending/new-arrival product settings.');
    }

    private function printSummary(array $productIds, array $categoryMap, array $brandMap, array $auth): void
    {
        $this->newLine();
        $this->info('=== IMPORT SUMMARY ===');
        $this->line('Products: ' . count($productIds));
        $this->line('Categories: ' . count($categoryMap));
        $this->line('Brands: ' . count($brandMap));
        $this->line('Users processed: ' . count($auth['passwords']));

        if ($auth['passwords']) {
            $this->newLine();
            $this->info('Accounts (WooCommerce password hashes are not portable — NEW accounts got a TEMP password):');
            $this->table(['Role', 'Email', 'Login', 'Password'], $auth['passwords']);
            $this->line('Existing emails were left untouched; for those, use "Forgot password" on the storefront to set a new one.');
        }

        $this->newLine();
        $this->line('Products were imported WITHOUT photos (image files live on the old host and were unavailable).');
        $this->line('Category redirect_to was set to category:{name} so storefront category links keep working.');
    }
}
