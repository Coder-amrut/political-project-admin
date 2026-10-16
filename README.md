# Political Field Operations & Management Platform

A field operations and election management platform designed for political campaigns, karyakarta coordination, voter engagement, and administrative oversight.

---

## 🏛️ Project Architecture

This monorepo repository comprises three key components:

1. **`field-management-api/` (Backend API)**
   - Built with **PHP 8.2+ / Laravel 11/13**, featuring **Laravel Sanctum** token-based authentication.
   - Comprehensive role-based access control (Admin, Officer/Neta, Worker/Karyakarta).
   - Geography hierarchy management, project workflows, citizen surveys, and audit logs.
   - Database support for MySQL 8 and SQLite.

2. **`political-web/` (Admin & Officer Web Portal)**
   - Built with **React 18**, **Vite**, **Tailwind CSS / Lucide icons**, and **React Router 6**.
   - Executive dashboard for Officers/Netas (booth performance, karyakarta analytics, citizen CRM).
   - Administrative workbench for project approvals, user management, and geographic mapping.

3. **`user portal/` (Field Worker & Citizen Survey Portal)**
   - Lightweight, responsive field portal for ground workers and karyakartas.
   - Supports offline-capable data collection, voter surveys, and dynamic multi-language forms.

4. **`Work/`**
   - Detailed functional specifications, architecture documentation, API schemas, and feature tracking.

---

## 🚀 Getting Started

### Prerequisites
- **PHP** 8.2 or higher & **Composer**
- **Node.js** 18+ and **npm**
- **MySQL** 8.0+ (or SQLite for local development)

### 1. Setting up Backend API (`field-management-api`)
```bash
cd field-management-api

# Install backend dependencies
composer install

# Configure environment file
cp .env.example .env

# Generate application key
php artisan key:generate

# Run database migrations and seeders
php artisan migrate --seed

# Start development server (Port 8000)
php artisan serve --port=8000
```

### 2. Setting up Admin/Officer Web Portal (`political-web`)
```bash
cd political-web

# Install frontend dependencies
npm install

# Start development server
npm run dev
```

### 3. Setting up User Portal (`user portal`)
```bash
cd "user portal"

# Install frontend dependencies
npm install

# Start development server
npm run dev
```

---

## 📂 Repository Structure

```
├── field-management-api/       # Laravel REST API backend
│   ├── app/                    # Controllers, Models, Middleware, Services
│   ├── database/               # Migrations, seeders, factories
│   └── routes/api.php          # API route definitions
├── political-web/              # React + Vite Admin/Officer web application
│   ├── src/pages/admin/        # Admin management & configuration screens
│   ├── src/pages/officer_Neta/ # Officer/Neta analytics and monitoring
│   └── src/pages/worker_Karyakarta/ # Field worker action items
├── user portal/                # React voter survey & citizen field app
├── Work/                       # Project specifications, overview, and docs
└── .gitignore                  # Global ignore patterns
```

---

## 🔒 Security & Privacy

- All API endpoints are guarded via Sanctum authentication and role-based policies.
- Secrets, credentials, `.env` files, and local build artifacts are excluded from version control.
