<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\V1\{
    AuthController, ProductController, CategoryController, BrandController,
    CollectionController, ProductVariantController, ProductImageController,
    OrderController, CustomerController, CustomerAddressController,
    CartController, CheckoutController, InventoryController, WarehouseController,
    SupplierController, PurchaseOrderController, CouponController, GiftCardController,
    FlashSaleController, ReviewController, ReturnController, RefundController,
    ShippingController, ShippingZoneController, TaxController, PaymentMethodController,
    BlogController, BlogCategoryController, PageController, BannerController,
    FaqController, TestimonialController, MediaController, MediaFolderController,
    NewsletterController, NotificationController, StaffController, RoleController,
    PermissionController, SettingController, AuditLogController, SystemLogController,
    DashboardController, AnalyticsController, ReportController, SearchController,
    SupportTicketController, WebhookController, DeveloperController, RazorpayWebhookController,
    ShiprocketController, ShiprocketWebhookController, ProductQuestionController
};

Route::prefix('v1')->group(function () {
    // Public routes
    Route::post('auth/login', [AuthController::class, 'login'])->middleware('throttle:5,1');
    Route::post('auth/register', [AuthController::class, 'register'])->middleware('throttle:10,1');
    Route::post('auth/forgot-password', [AuthController::class, 'forgotPassword'])->middleware('throttle:5,1');
    Route::post('auth/reset-password', [AuthController::class, 'resetPassword'])->middleware('throttle:5,1');

    // Public storefront
    Route::get('products/search', [SearchController::class, 'search']);
    Route::get('products', [ProductController::class, 'index']);
    Route::get('products/{product}', [ProductController::class, 'show']);
    Route::post('products/{product}/notify-back-in-stock', [ProductController::class, 'notifyBackInStock'])->middleware('throttle:10,1');
    Route::get('products/{product}/reviews', [ReviewController::class, 'publicReviews']);
    Route::get('products/{product}/questions', [ProductQuestionController::class, 'index']);
    Route::get('categories', [CategoryController::class, 'index']);
    Route::get('categories/{category}', [CategoryController::class, 'show']);
    Route::get('brands', [BrandController::class, 'index']);
    Route::get('brands/{brand}', [BrandController::class, 'show']);
    Route::get('collections', [CollectionController::class, 'index']);
    Route::get('collections/{collection}', [CollectionController::class, 'show']);
    Route::get('pages/{slug}', [PageController::class, 'show']);
    Route::get('banners', [BannerController::class, 'index']);
    Route::get('blogs', [BlogController::class, 'index']);
    Route::get('blogs/{blog}', [BlogController::class, 'show']);
    Route::get('faqs', [FaqController::class, 'index']);
    Route::get('testimonials', [TestimonialController::class, 'index']);
    Route::get('settings', [SettingController::class, 'publicStorefront']);
    Route::get('settings/public/{group}', [SettingController::class, 'public']);
    Route::post('newsletter/subscribe', [NewsletterController::class, 'subscribe'])->middleware('throttle:10,1');
    Route::post('newsletter/unsubscribe', [NewsletterController::class, 'unsubscribe'])->middleware('throttle:10,1');

    // Guest checkout
    Route::post('checkout/init', [CheckoutController::class, 'init'])->middleware('throttle:30,1');
    Route::post('checkout/verify', [CheckoutController::class, 'verify'])->middleware('throttle:60,1');
    Route::post('checkout/shipping-rates', [CheckoutController::class, 'shippingRates'])->middleware('throttle:30,1');

    // Customization uploads
    Route::post('customization/upload', [MediaController::class, 'upload'])->middleware('throttle:20,1');

    // Payment provider webhooks (signature verified, no auth)
    Route::post('payments/razorpay/webhook', [RazorpayWebhookController::class, 'handle'])->middleware('throttle:60,1');

    // Shiprocket tracking webhook (token verified)
    Route::post('shiprocket/webhook', [ShiprocketWebhookController::class, 'handle'])->middleware('throttle:60,1');

    // Authenticated customer routes
    Route::middleware('auth:sanctum')->group(function () {
        Route::post('auth/logout', [AuthController::class, 'logout']);
        Route::get('auth/me', [AuthController::class, 'me']);
        Route::put('auth/password', [AuthController::class, 'updatePassword']);

        Route::get('cart', [CartController::class, 'index']);
        Route::post('cart/items', [CartController::class, 'addItem']);
        Route::put('cart/items/{cartItem}', [CartController::class, 'updateItem']);
        Route::delete('cart/items/{cartItem}', [CartController::class, 'removeItem']);
        Route::post('cart/apply-coupon', [CartController::class, 'applyCoupon']);
        Route::delete('cart/coupon', [CartController::class, 'removeCoupon']);
        Route::delete('cart', [CartController::class, 'clear']);

        Route::post('checkout/validate', [CheckoutController::class, 'validate']);
        Route::post('checkout/shipping', [CheckoutController::class, 'shipping']);

        Route::get('customer/profile', [CustomerController::class, 'profile']);
        Route::put('customer/profile', [CustomerController::class, 'updateProfile']);
        Route::get('customer/{customer}/addresses', [CustomerAddressController::class, 'index']);
        Route::post('customer/{customer}/addresses', [CustomerAddressController::class, 'store']);
        Route::put('customer/{customer}/addresses/{address}', [CustomerAddressController::class, 'update']);
        Route::delete('customer/{customer}/addresses/{address}', [CustomerAddressController::class, 'destroy']);
        Route::get('customer/orders', [OrderController::class, 'myOrders']);
        Route::get('customer/wishlist', [CustomerController::class, 'wishlist']);
        Route::post('customer/wishlist', [CustomerController::class, 'addToWishlist']);
        Route::delete('customer/wishlist/{product}', [CustomerController::class, 'removeFromWishlist']);

        Route::post('reviews', [ReviewController::class, 'store']);
        Route::post('products/{product}/questions', [ProductQuestionController::class, 'store']);
        Route::get('notifications', [NotificationController::class, 'index']);
        Route::post('notifications/{notification}/read', [NotificationController::class, 'markAsRead']);
        Route::post('notifications/read-all', [NotificationController::class, 'markAllAsRead']);
    });

    // Admin routes
    Route::middleware(['auth:sanctum', 'admin.role'])->prefix('admin')->group(function () {
        // Dashboard
        Route::get('dashboard/stats', [DashboardController::class, 'stats']);
        Route::get('dashboard/revenue-chart', [DashboardController::class, 'revenueChart']);
        Route::get('dashboard/sales-chart', [DashboardController::class, 'salesChart']);
        Route::get('dashboard/orders-chart', [DashboardController::class, 'ordersChart']);
        Route::get('dashboard/top-products', [DashboardController::class, 'topProducts']);
        Route::get('dashboard/top-categories', [DashboardController::class, 'topCategories']);
        Route::get('dashboard/top-customers', [DashboardController::class, 'topCustomers']);
        Route::get('dashboard/latest-orders', [DashboardController::class, 'latestOrders']);
        Route::get('dashboard/latest-reviews', [DashboardController::class, 'latestReviews']);
        Route::get('dashboard/inventory-alerts', [DashboardController::class, 'inventoryAlerts']);

        // Analytics
        Route::get('analytics/overview', [AnalyticsController::class, 'overview']);
        Route::get('analytics/revenue', [AnalyticsController::class, 'revenue']);
        Route::get('analytics/orders', [AnalyticsController::class, 'orders']);
        Route::get('analytics/customers', [AnalyticsController::class, 'customers']);
        Route::get('analytics/products', [AnalyticsController::class, 'products']);
        Route::get('analytics/conversion', [AnalyticsController::class, 'conversion']);

        // Products
        Route::apiResource('products', ProductController::class);
        Route::post('products/bulk-update-status', [ProductController::class, 'bulkUpdateStatus']);
        Route::post('products/bulk-delete', [ProductController::class, 'bulkDelete']);
        Route::post('products/import', [ProductController::class, 'import']);
        Route::get('products/export', [ProductController::class, 'export']);
        Route::post('products/{product}/duplicate', [ProductController::class, 'duplicate']);
        Route::post('products/{product}/restore', [ProductController::class, 'restore'])->withTrashed();
        Route::get('products/trashed', [ProductController::class, 'trashed']);
        Route::get('products/{product}/activity', [ProductController::class, 'activity']);
        Route::get('products/search', [SearchController::class, 'globalSearch']);

        // Variants
        Route::get('products/{product}/variants', [ProductVariantController::class, 'index']);
        Route::post('products/{product}/variants', [ProductVariantController::class, 'store']);
        Route::put('products/{product}/variants/{variant}', [ProductVariantController::class, 'update']);
        Route::delete('products/{product}/variants/{variant}', [ProductVariantController::class, 'destroy']);

        // Images
        Route::get('products/{product}/images', [ProductImageController::class, 'index']);
        Route::post('products/{product}/images', [ProductImageController::class, 'store']);
        Route::delete('products/{product}/images/{image}', [ProductImageController::class, 'destroy']);
        Route::post('products/{product}/images/reorder', [ProductImageController::class, 'reorder']);
        Route::post('products/{product}/images/{image}/primary', [ProductImageController::class, 'setPrimary']);

        // Categories
        Route::apiResource('categories', CategoryController::class);
        Route::get('categories/tree', [CategoryController::class, 'tree']);
        Route::post('categories/reorder', [CategoryController::class, 'reorder']);
        Route::post('categories/{category}/restore', [CategoryController::class, 'restore']);

        // Brands
        Route::apiResource('brands', BrandController::class);

        // Collections
        Route::apiResource('collections', CollectionController::class);
        Route::post('collections/{collection}/products', [CollectionController::class, 'assignProducts']);
        Route::delete('collections/{collection}/products/{product}', [CollectionController::class, 'removeProduct']);

        // Orders
        Route::apiResource('orders', OrderController::class)->only(['index', 'show']);
        Route::put('orders/{order}/status', [OrderController::class, 'updateStatus']);
        Route::post('orders/{order}/notes', [OrderController::class, 'addNote']);
        Route::get('orders/{order}/timeline', [OrderController::class, 'timeline']);
        Route::get('orders/export', [OrderController::class, 'export']);
        Route::post('orders/bulk-update-status', [OrderController::class, 'bulkUpdateStatus']);
        Route::post('orders/{order}/shiprocket/ship', [ShiprocketController::class, 'ship'])->middleware('permission:orders.edit');
        Route::get('orders/{order}/shiprocket/tracking', [ShiprocketController::class, 'tracking']);
        Route::post('orders/{order}/shiprocket/cancel', [ShiprocketController::class, 'cancel'])->middleware('permission:orders.edit');

        // Customers
        Route::apiResource('customers', CustomerController::class);
        Route::get('customers/{customer}/orders', [CustomerController::class, 'orders']);
        Route::get('customers/{customer}/activity', [CustomerController::class, 'activity']);
        Route::post('customers/{customer}/notes', [CustomerController::class, 'addNote']);

        // Inventory
        Route::get('inventory', [InventoryController::class, 'index']);
        Route::post('inventory/adjust', [InventoryController::class, 'adjust']);
        Route::get('inventory/{variant}/movements', [InventoryController::class, 'movements']);
        Route::get('inventory/{variant}', [InventoryController::class, 'show']);
        Route::get('inventory/alerts', [InventoryController::class, 'alerts']);
        Route::post('inventory/transfer', [InventoryController::class, 'transfer']);

        // Warehouses
        Route::apiResource('warehouses', WarehouseController::class);

        // Suppliers
        Route::apiResource('suppliers', SupplierController::class);

        // Purchase Orders
        Route::apiResource('purchase-orders', PurchaseOrderController::class);
        Route::post('purchase-orders/{purchaseOrder}/receive', [PurchaseOrderController::class, 'receive']);
        Route::post('purchase-orders/{purchaseOrder}/send', [PurchaseOrderController::class, 'send']);

        // Marketing
        Route::apiResource('coupons', CouponController::class);
        Route::post('coupons/validate', [CouponController::class, 'validate']);
        Route::get('coupons/{coupon}/usages', [CouponController::class, 'usages']);
        Route::apiResource('gift-cards', GiftCardController::class);
        Route::get('gift-cards/{giftCard}/transactions', [GiftCardController::class, 'transactions']);
        Route::apiResource('flash-sales', FlashSaleController::class);
        Route::post('flash-sales/{flashSale}/products', [FlashSaleController::class, 'addProducts']);
        Route::delete('flash-sales/{flashSale}/products/{product}', [FlashSaleController::class, 'removeProduct']);

        // Reviews
        Route::apiResource('reviews', ReviewController::class)->only(['index', 'show', 'destroy']);
        Route::post('reviews/{review}/approve', [ReviewController::class, 'approve']);
        Route::post('reviews/{review}/feature', [ReviewController::class, 'feature']);

        // Returns & Refunds
        Route::apiResource('returns', ReturnController::class);
        Route::put('returns/{return}/status', [ReturnController::class, 'updateStatus']);
        Route::post('returns/{return}/approve', [ReturnController::class, 'approve']);
        Route::post('returns/{return}/reject', [ReturnController::class, 'reject']);
        Route::post('returns/{return}/process-refund', [ReturnController::class, 'processRefund'])->middleware('permission:orders.edit');
        Route::apiResource('refunds', RefundController::class)->only(['index', 'show']);
        Route::post('refunds/{refund}/process', [RefundController::class, 'process'])->middleware('permission:orders.edit');

        // Shipping
        Route::apiResource('shipping-methods', ShippingController::class);
        Route::apiResource('shipping-zones', ShippingZoneController::class);

        // Tax
        Route::apiResource('tax-rates', TaxController::class);

        // Payment Methods
        Route::apiResource('payment-methods', PaymentMethodController::class);

        // CMS
        Route::apiResource('blogs', BlogController::class);
        Route::apiResource('blog-categories', BlogCategoryController::class);
        Route::apiResource('pages', PageController::class)->except(['show']);
        Route::apiResource('banners', BannerController::class);
        Route::apiResource('faqs', FaqController::class);
        Route::apiResource('testimonials', TestimonialController::class);

        // Media
        Route::get('media', [MediaController::class, 'index']);
        Route::post('media/upload', [MediaController::class, 'upload']);
        Route::post('media/bulk-upload', [MediaController::class, 'bulkUpload']);
        Route::put('media/{media}', [MediaController::class, 'update']);
        Route::delete('media/{media}', [MediaController::class, 'destroy']);
        Route::post('media/{media}/crop', [MediaController::class, 'crop']);
        Route::post('media/{media}/compress', [MediaController::class, 'compress']);
        Route::post('media/{media}/rename', [MediaController::class, 'rename']);
        Route::apiResource('media-folders', MediaFolderController::class);

        // Newsletter
        Route::get('newsletter/subscribers', [NewsletterController::class, 'subscribers']);
        Route::delete('newsletter/subscribers/{subscriber}', [NewsletterController::class, 'subscriberDestroy']);
        Route::post('newsletter/campaigns', [NewsletterController::class, 'createCampaign']);
        Route::post('newsletter/campaigns/{campaign}/send', [NewsletterController::class, 'sendCampaign']);

        // Reports
        Route::get('reports/sales', [ReportController::class, 'sales']);
        Route::get('reports/revenue', [ReportController::class, 'revenue']);
        Route::get('reports/profit', [ReportController::class, 'profit']);
        Route::get('reports/inventory', [ReportController::class, 'inventory']);
        Route::get('reports/customers', [ReportController::class, 'customers']);
        Route::get('reports/products', [ReportController::class, 'products']);
        Route::get('reports/taxes', [ReportController::class, 'taxes']);
        Route::get('reports/coupons', [ReportController::class, 'coupons']);
        Route::get('reports/returns', [ReportController::class, 'returns']);
        Route::get('reports/shipping', [ReportController::class, 'shipping']);
        Route::post('reports/export', [ReportController::class, 'export']);

        // Settings
        Route::get('settings', [SettingController::class, 'index'])->middleware('permission:settings.edit');
        Route::put('settings', [SettingController::class, 'update'])->middleware('permission:settings.edit');
        Route::put('settings/{group}', [SettingController::class, 'update'])->middleware('permission:settings.edit');
        Route::post('settings/logo', [SettingController::class, 'uploadLogo'])->middleware('permission:settings.edit');
        Route::post('settings/favicon', [SettingController::class, 'uploadFavicon'])->middleware('permission:settings.edit');

        // Staff & Roles
        Route::apiResource('staff', StaffController::class)->middleware('permission:staff.edit');
        Route::post('staff/{staff}/status', [StaffController::class, 'toggleStatus'])->middleware('permission:staff.edit');
        Route::apiResource('roles', RoleController::class)->middleware('permission:roles.edit');
        Route::get('permissions', [PermissionController::class, 'index']);
        Route::put('permissions/matrix', [PermissionController::class, 'updateMatrix'])->middleware('permission:roles.edit');

        // System
        Route::get('audit-logs', [AuditLogController::class, 'index']);
        Route::get('audit-logs/{auditLog}', [AuditLogController::class, 'show']);
        Route::get('system-logs', [SystemLogController::class, 'index']);
        Route::get('system-logs/{systemLog}', [SystemLogController::class, 'show']);

        // Support
        Route::apiResource('support-tickets', SupportTicketController::class);
        Route::post('support-tickets/{ticket}/assign', [SupportTicketController::class, 'assign']);
        Route::post('support-tickets/{ticket}/status', [SupportTicketController::class, 'updateStatus']);

        // Webhooks & API
        Route::apiResource('api-keys', DeveloperController::class);
        Route::apiResource('webhooks', WebhookController::class);
        Route::get('webhooks/{webhook}/logs', [WebhookController::class, 'logs']);

        // Global search
        Route::get('search', [SearchController::class, 'globalSearch']);
    });
});
