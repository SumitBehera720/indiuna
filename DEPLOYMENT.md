# INDIUNA - Deployment Guide

## Project Structure

```
D:\indiuna\
├── public/              # Frontend static assets
├── src/                 # React frontend (storefront)
├── backend/             # Laravel API backend
├── admin/               # React admin panel
├── vite.config.js       # Frontend Vite config
└── package.json         # Frontend dependencies
```

## Prerequisites

- **PHP 8.3+** with extensions: BCMath, Ctype, Fileinfo, JSON, Mbstring, OpenSSL, PDO, Tokenizer, XML, GD, MySQL
- **Composer 2.x**
- **Node.js 18+** and **npm**
- **MySQL 8.0+** or **SQLite** (dev)
- **Redis** (for caching & queues)

---

## 1. Backend Setup (Laravel)

### 1.1 Environment Configuration

```bash
cd backend
cp .env.example .env
```

Edit `.env` with your database credentials:

```env
APP_NAME=Indiuna
APP_ENV=production
APP_DEBUG=false
APP_URL=https://yourdomain.com

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=indiuna
DB_USERNAME=root
DB_PASSWORD=yourpassword

SESSION_DRIVER=redis
CACHE_STORE=redis
QUEUE_CONNECTION=redis

MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your@email.com
MAIL_PASSWORD=your-app-password
MAIL_FROM_ADDRESS=noreply@indiuna.com

FILESYSTEM_DISK=public
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

### 1.2 Install & Migrate

```bash
composer install --no-dev --optimize-autoloader
php artisan key:generate
php artisan storage:link
php artisan migrate --seed
php artisan db:seed --class=AdminUserSeeder
```

### 1.3 Production Optimization

```bash
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan event:cache
php artisan optimize
```

### 1.4 Queue & Scheduler

Add to crontab (`crontab -e`):
```cron
* * * * * cd /path-to-backend && php artisan schedule:run >> /dev/null 2>&1
```

Run queue worker:
```bash
php artisan queue:work redis --daemon
```

For Hostinger, use the cron job panel to add:
```
* * * * * /usr/bin/php /home/username/public_html/backend/artisan schedule:run
```

### 1.5 Hostinger .htaccess (backend/public)

The `.htaccess` file in `backend/public/` is pre-configured for Laravel. Ensure it routes all requests to `index.php`.

---

## 2. Frontend Setup (Storefront)

### 2.1 Environment

Create `D:\indiuna\.env`:
```env
VITE_API_URL=https://yourdomain.com/api/v1
```

### 2.2 Install & Build

```bash
npm install
npm run build
```

The build output goes to `D:\indiuna\dist\`. Point your web server (or Hostinger) to this directory.

### 2.3 Vite Proxy (Development Only)

For local dev, the existing setup proxies `/api` to `http://localhost:8000`.

---

## 3. Admin Panel Setup

### 3.1 Environment

Create `D:\indiuna\admin\.env`:
```env
VITE_API_URL=https://yourdomain.com/api/v1
```

### 3.2 Install & Build

```bash
cd admin
npm install --legacy-peer-deps
npm run build
```

Build output: `D:\indiuna\admin\dist\`. Deploy this as a subdomain (e.g., `admin.yourdomain.com`) or subdirectory.

### 3.3 Development

```bash
cd admin
npm run dev
# Runs on http://localhost:5173, proxies /api to http://localhost:8000
```

---

## 4. Hostinger Deployment Checklist

### Shared Hosting

1. **Upload files** via cPanel File Manager or Git:
   - Upload `backend/` contents to `/home/username/backend/`
   - Upload `dist/` (frontend build) to `/home/username/public_html/`
   - Upload `admin/dist/` to `/home/username/public_html/admin/`

2. **Set up MySQL database** in cPanel → MySQL Databases

3. **Configure .env** with Hostinger database credentials

4. **Run artisan commands** via SSH or PHP CLI:
   ```bash
   cd /home/username/backend
   php artisan migrate --seed
   php artisan config:cache
   php artisan route:cache
   ```

5. **Set up cron job** in cPanel:
   ```
   * * * * * /usr/bin/php /home/username/backend/artisan schedule:run
   ```

6. **Point domain** to `public_html/` for storefront, `public_html/admin/` for admin

### VPS / Dedicated

For better performance, run on a VPS with:
- Nginx with PHP-FPM
- Redis server
- Supervisor for queue workers

---

## 5. Post-Deployment

### Admin Access

After seeding, login with:
- Email: `admin@indiuna.com`
- Password: (check `AdminUserSeeder.php` or set in `.env`)

### First Steps

1. Configure store settings at `/admin/settings`
2. Add categories under `/admin/categories`
3. Add brands under `/admin/products` → Brands
4. Add products with variants and images
5. Set up shipping methods and tax rates
6. Configure payment gateway

### Optimization

```bash
# Cache everything
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Optimize Composer
composer install --no-dev --optimize-autoloader

# Storage link
php artisan storage:link
```

---

## 6. Security Checklist

- [ ] Set `APP_DEBUG=false` in production
- [ ] Use HTTPS (SSL certificate)
- [ ] Set strong `APP_KEY`
- [ ] Configure rate limiting in `.env`
- [ ] Set up firewall (CSRF, XSS protection built-in)
- [ ] Regular backups of database
- [ ] Monitor failed login attempts
- [ ] Keep PHP, Composer, and npm packages updated

---

## 7. API Documentation

API is available at `/api/v1/` with the following resource groups:

| Group | Prefix | Auth Required |
|-------|--------|---------------|
| Auth | `/auth/*` | Public / Sanctum |
| Products | `/admin/products/*` | Sanctum |
| Categories | `/admin/categories/*` | Sanctum |
| Orders | `/admin/orders/*` | Sanctum |
| Customers | `/admin/customers/*` | Sanctum |
| Cart | `/cart/*` | Sanctum |
| Checkout | `/checkout/*` | Sanctum |
| Dashboard | `/admin/dashboard/*` | Sanctum+Admin |
| Analytics | `/admin/analytics/*` | Sanctum+Admin |
| CMS | `/admin/blogs/*`, `/admin/pages/*` | Sanctum+Admin |
| Media | `/admin/media/*` | Sanctum+Admin |
| Settings | `/admin/settings/*` | Sanctum+Admin |

---

## 8. Backup Strategy

### Database
```bash
# MySQL dump
mysqldump -u username -p indiuna > backup_$(date +%Y%m%d).sql

# Or via cPanel -> Backup Wizard
```

### Files
- `/storage/app/public/` - Uploaded media
- `.env` - Configuration (store securely)
- `/public/images/` - Product images

Schedule weekly backups via cron or cPanel backup tools.
