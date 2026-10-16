# Project Overview

## Introduction

The repository contains the first working parts of a field management platform for election and political field operations. The current implementation is a web frontend plus a Laravel API. It provides account access and admin APIs for projects and hierarchical geography. It is not yet the full mobile and central management product described in the requirements.

## Objective and problem area

The supplied Marathi feature document describes a reusable system for creating election or field projects, organizing geography and teams, recording field activities, and monitoring progress from central dashboards. The codebase currently establishes account and administration foundations for this system. Field data capture, operations, analytics, and mobile clients remain future work unless listed as implemented in the companion documents.

## Technology

| Area | Technology evidenced in the repository |
|---|---|
| Backend API | PHP 8.3+, Laravel 13, Laravel Sanctum |
| Web client | React 18, React Router 6, Axios, Vite 6 |
| Database support | Laravel SQLite and MySQL connections; the README describes importing the MySQL schema dump |
| Database reference | MySQL 8 dump in field_management_final_schema.sql |

Dependency versions are declared in field-management-api/composer.json and political-web/package.json. This document records declarations, not a fresh environment or deployment check.

## Architecture and request flow

1. The React app starts in political-web/src/main.jsx and mounts political-web/src/App.jsx.
2. App.jsx wraps the routes in BrowserRouter and AuthProvider.
3. The auth pages and route guards call the auth context and service. The Axios client sends requests to the configured API base URL and attaches a stored Sanctum bearer token when present.
4. Laravel routes in field-management-api/routes/api.php dispatch requests to auth and admin controllers. Admin routes require Sanctum authentication and the EnsureAdmin middleware.
5. Controllers validate data through request classes, use Eloquent models, and record selected events through AuditService.

## Implemented modules

- Authentication and registration for Worker and Officer accounts, login, logout, and current-user lookup.
- Admin approval/rejection of self-registered accounts and direct creation of Worker/Officer accounts.
- Admin project listing, creation, lookup, metadata update, and controlled status changes.
- Admin management of geography nodes attached to projects, with a seeded ordered geography-type list.
- A small React web interface for home, login, registration, guarded role routes, and session-detail pages.

See 05_Features Completed/Features Completed.md for behavior and exact file references. See 03_Pending Work/Pending Work.md for the requirement-by-requirement comparison.

## Main repository structure

- field-management-api/app: Laravel controllers, middleware, requests, models, enums, console command, and audit service.
- field-management-api/routes: API, web, and console route definitions.
- field-management-api/database: migrations, seeders, factory, and SQLite database file.
- field-management-api/tests: feature and unit test source, organized partly by implementation phase.
- political-web/src: React app, routes, auth pages, dashboards, API client, service, and auth state.
- field_management_final_schema.sql: MySQL schema/reference dump.
- Complete_Features_Marathi (1).pdf: supplied product requirements source, also copied into each application directory.
- Work: this progress documentation.

## Database and API notes

The reference MySQL dump defines 16 tables: users, roles, user_roles, permissions, role_permissions, projects, geography_types, geographies, worker_profiles, officer_profiles, user_project_assignments, user_geography_assignments, attendance_events, sync_operations, sync_conflicts, and audit_logs. These tables describe storage structures; table presence alone does not mean the related feature has API behavior.

The API paths currently defined are under /api/auth and /api/admin. The admin API covers account approvals and creation, projects, geography types, and project geographies. No API routes are present for field activity, surveys, CRM, attendance, exports, notifications, analytics, or offline synchronization.

The app config defaults to SQLite when DB_CONNECTION is unset. The README documents a MySQL setup using the root schema dump. The consolidated schema migration is guarded for the testing environment; inspect field-management-api/database/migrations/0001_01_01_000000_create_users_table.php before relying on migrations as the production MySQL setup. The SQL dump is the referenced production schema source in the README.

## Scope and evidence

This overview is based on the checked-in requirements text, source files, configuration, SQL dump, README, and test source. Tests were not executed for this documentation task. The implementation status is described from code inspection and should not be read as a deployment or live-database verification.

run frontend : npm run dev
run backend : php artisan serve --port=8000