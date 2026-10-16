# Political Project — AI Handoff

This file records the useful conversation and implementation context for another AI assistant continuing work in this repository. It is a chronological summary, not a verbatim export of every pasted browser log.

## Workspace

- Root: `D:\InfoYashonand Sangli\Political-Project\Political-Project-Clean`
- Laravel API: `field-management-api`
- React/Vite frontend: `political-web`
- Frontend API client: `political-web/src/api/axios.js`
- Main current work area: Admin dashboard project creation and geography selection.
- Do not expose `.env` credentials. Read them only when required, and never copy secret values into handoff files or chat.

## Conversation history and requirements

1. The user asked whether a master-data API had been created.
2. The user listed required admin-dashboard capabilities: system administration, user creation, role-based access, master-data management, form/survey builder, geography structure setup/editing, data approval/correction, backup/restore, audit log, and security monitoring.
3. The user asked to run the AdminDashboard project.
4. The user created an `admins` table with `id`, `name`, `email`, `password`, timestamps, and asked to connect it to the database.
5. The user reported a network error and asked to solve it and run the backend.
6. Laravel reported `could not find driver` for MySQL. The PHP MySQL PDO extension was enabled in the local CLI PHP configuration in earlier work.
7. The user created an admin with `php artisan admin:create`, then reported `This password does not use the Bcrypt algorithm`, 401/422/500 login requests, and asked where admins are stored. The established auth flow is based on the application's `users` table and user roles; `admin:create` must write credentials compatible with `User::getAuthPassword()` and the configured hash.
8. Login later failed because `personal_access_tokens` was missing. A Sanctum migration was added and applied. The user clarified they wanted the artisan admin creation command to create a login-capable user in `users`.
9. The user provided a project-creation form specification and asked for a matching implementation that fetches data from the backend. Project scope should allow independent targets; do not force every project through a fixed District → Lok Sabha → Assembly chain.
10. For Lok Sabha selection, the user requested showing only the related Vidhan Sabha constituencies, then clarified the user must be able to choose a Vidhan Sabha from a dropdown.
11. The user asked for an assign-members option after project creation. Workers and officers must come from the database.
12. The user requested a language option with English and Marathi.
13. The user specified geography flows:
    - **Lok Sabha:** select Lok Sabha (example Sangli), then relevant District (example Sangli), Taluka, Village, Polling Station.
    - **District:** select District, then Taluka, Village, Polling Station.
    - **Assembly:** select Assembly (example `282 — Sangli`), then Taluka/Village/Polling Station filtered to it.
    - A user must be able to select multiple lower-level items.
14. Most recent issue: after selecting any Vidhan Sabha, show its district(s); the user could not select a Taluka. A backend lookup was added for assembly districts and talukas; the multi-select dropdown behavior was fixed so options remain available after selecting one.
15. Most recent current request: create one file containing enough conversation/project context for another AI to continue work. This document fulfills that request.

## Relevant implementation already in the repository

### Admin dashboard

- `political-web/src/pages/admin/AdminDashboard.jsx`
  - Admin dashboard sections and project list.
  - Project member assignment panel opens after a project is created and can also be opened for existing projects.
  - Language dropdown offers English and Marathi and persists the choice under `admin-language` in local storage.
- `political-web/src/pages/admin/ProjectCreateForm.jsx`
  - Project creation form and scope-specific geography selectors.
  - Search options load through the API.
  - Taluka, Village, Polling Station and Lok Sabha-related Assembly choices support multiple selections where appropriate.
  - The project target remains its top-level selected scope; lower selections are stored in `geographic_context`.
- `political-web/src/i18n/adminTranslations.js`
  - Small English/Marathi translation map and React tree translator.

### Project/member backend

- `field-management-api/app/Http/Controllers/Admin/ProjectController.php`
  - Creates and lists projects.
  - Provides project member lookup and assignment actions.
  - Project formatting includes geographic scope, target fields, and `geographic_context`.
- `field-management-api/app/Models/UserProjectAssignment.php`
- `field-management-api/app/Models/Project.php`
- `field-management-api/routes/api.php`
  - Admin project routes include `GET /api/admin/projects/{uuid}/members` and `PUT /api/admin/projects/{uuid}/members`.
- `field-management-api/database/migrations/2026_10_01_000003_add_project_member_assignments.php`
  - Assignment storage is `user_project_assignments`.
- Member list includes active `WORKER` and `OFFICER` users only. Assignments save to the database.

### Geography APIs and master data

- `field-management-api/app/Http/Controllers/Admin/ProjectGeographyLookupController.php`
  - Admin lookups for districts, Lok Sabha constituencies, assemblies, Lok Sabha-related assemblies/districts, Assembly-related districts/talukas, and polling stations.
- `field-management-api/app/Http/Controllers/MasterDataController.php`
  - Shared master-data APIs for states, districts, talukas, villages, and local bodies.
  - Taluka/village search and optional Assembly filtering are supported. Assembly filtering uses polling-station location mappings when available.
- `field-management-api/app/Http/Requests/Admin/StoreProjectRequest.php`
  - Validates project geographic context including arrays of assembly, taluka, village, and polling-station selections.
- `field-management-api/database/migrations/2026_10_01_000002_add_project_scope_and_election_master_data.php`
  - Adds project geographic columns and creates `polling_stations` if absent.
- `field-management-api/database/migrations/2026_10_01_000004_add_polling_station_location_filters.php`
  - Adds optional `taluka_code` and `village_code` fields to polling stations.

Public master-data API routes are under `/api/master-data/*`. Admin project-geography routes are under `/api/admin/project-geography/*` and require an authenticated admin.

## Database facts verified during the work

- Configured database name observed in errors/status: `political-project` (MySQL on `127.0.0.1:3306`). Do not record or reveal the DB password.
- The core user/project migration files showed `Pending` in the latest `php artisan migrate:status`, while the newer migrations for Sanctum tokens, project geography, project member assignments, and polling-station location fields showed `Ran`. This means the schema was not a clean all-migrations-applied state; inspect before running broad migrations.
- `districts` has Marathi names, and Sangli is `district_code = 493`.
- `vidhan_sabha` has only `id` and `name`; Assembly `282` is Sangli.
- Lok Sabha `44` is Sangli. Its mapping includes these Vidhan Sabha names: Miraj, Sangli, Palus-Kadegaon, Khanapur, Tasgaon-Kavathe Mahankal, Jat.
- Sangli district has 10 Talukas in the LGD master data (codes 4295–4304): Shirala, Walwa, Palus, Kadegaon, Khanapur, Atpadi, Tasgaon, Miraj, Kavathemahankal, Jat.
- `polling_stations` had **0 rows** during the last database query. Thus the endpoint can fetch stations from the backend, but it will return no results until the table is populated.
- There is no complete normalized Assembly → District/Taluka crosswalk in the current master schema. The current resolver uses direct district-name matches, Assembly-name/Taluka-name matching, and polling-station mappings where present. This is a practical fallback, not authoritative boundary data for every constituency.

## Recent validation

- Laravel PHP syntax checks passed for changed controllers, request, and migration.
- Laravel route listing showed Assembly district and Taluka lookup routes.
- A direct backend query for Assembly 282 returned District Sangli and 10 Talukas.
- Babel parser successfully parsed `ProjectCreateForm.jsx` after the multi-select changes.
- A Vite production build previously failed with `esbuild spawn EPERM` in the restricted environment. If a build is required, retry only when the environment permits esbuild to start; do not misreport this as a source syntax error.
- Do not run the test suite unless the user asks for tests/verification.

## Guidance for continuing

1. Read `ProjectCreateForm.jsx` and `ProjectGeographyLookupController.php` first; the latest issue was around the Assembly → District → Taluka flow.
2. Preserve backend-driven selectors and the user’s ability to select multiple lower-level locations.
3. Keep the top-level scope target distinct from selected child locations. Save child selections in `projects.geographic_context`.
4. For exact Assembly-to-district/taluka filtering across every constituency, obtain/import an authoritative crosswalk or polling-station dataset. Do not claim that the current name-based inference is complete.
5. Keep the admin UI’s Marathi/English switch working when editing translated labels.
