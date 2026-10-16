# Pending Work

Status compares the supplied complete feature document with implemented API/UI code. A database table, model, test name, or product description alone is not considered a completed user-facing feature.

## Requirement cross-check

| Requirement from the supplied feature document | Status | Code evidence / current gap | Documentation |
|---|---|---|---|
| Worker and Officer secure sign-in | Partial | Login, Sanctum token handling, throttles, and account status checks exist. Two-factor authentication and the full security suite are absent. AuthController.php; routes/api.php | 05_Features Completed |
| Worker/Officer profile and responsibilities | Partial | Account identity is returned and shown; dedicated profile editing and responsibility assignment workflows are absent. WorkerProfile.php, OfficerProfile.php have no corresponding API routes. | 05_Features Completed |
| State-to-area geography structure | Partial | Admin can create project-scoped nodes using nine ordered types. Type administration/reconfiguration and non-admin workflows are absent. GeographyController.php, GeographyTypeController.php | 05_Features Completed |
| Person/family/contact information and contact history | Pending | No CRM/contact APIs or screens. | This file |
| Survey forms, responses, and survey builder | Pending | No survey routes, controller, or frontend module. | This file |
| Citizen problems/requests | Pending | No issue/request capture or tracking module. | This file |
| Programs, meetings, events, tours, and attendance | Pending | No operational endpoints/screens. An attendance table/model exists, but no attendance API workflow. | This file |
| Task assignment, follow-up, and pending/completed tasks | Pending | No task or follow-up API/UI. | This file |
| Online field updates and collection workflows | Pending | The web app has online auth, but no field-activity entry, assignment update, or collection workflow. | This file |
| Photo/document upload and document management | Pending | No upload or document management route/UI. | This file |
| GPS/location tagging and geofencing | Partial | Geography nodes can store coordinates; no attendance capture, geofencing, or map UI. | This file |
| Offline data entry, secure local queue, automatic sync, conflict/duplicate resolution | Pending | Sync tables/models are only data structures; no sync endpoints/client queue/resolution workflow. | This file |
| Officer area-progress and worker-performance dashboards | Pending | Officer page displays the current account session only; no metrics or progress data. OfficerDashboard.jsx | This file |
| Admin/command dashboard and central live command centre | Pending | Admin page displays account session only; no monitoring dashboard/command centre. AdminDashboard.jsx | This file |
| User creation and role-based access | Partial | Backend supports admin creation and an ADMIN-only route group; frontend protects role landing routes. Fine-grained permissions and user/permission management are not implemented. | 05_Features Completed |
| Field data approval and correction | Pending | User account approval exists, but there is no review/correction workflow for collected field data. | This file |
| Master data and election/project management | Partial | Projects can be managed through API; there is no project-management UI, election-specific workflow, or broader master-data editor. ProjectController.php | 05_Features Completed |
| Geography/booth administration | Partial | Geography CRUD/status APIs exist; no booth-specific operations UI or type-structure editor. | 05_Features Completed |
| CRM, volunteer/worker management, tours, meetings, events | Pending | No operational modules/routes/screens for these requirements. | This file |
| Analytics, reports, report filters, Excel/PDF/CSV export | Pending | No analytics/reporting endpoints or screens. | This file |
| Notifications, alerts, and push notifications | Pending | No notification module or push integration. | This file |
| Public self-service portal | Pending | No public portal is present. | This file |
| Independent political representative/organization portal | Pending | No dedicated political portal or organization management module is present. | This file |
| Three separate mobile apps (Worker, Officer, Admin/Command) | Pending | Repository contains one React web client; no native mobile application projects. | This file |
| Android first and later iOS support | Pending | No Android/iOS client project. | This file |
| Multi-language user interface | Pending | Current web strings are hard-coded in English; no localization framework/messages. | This file |
| Secure cloud/server sync and third-party API integration | Pending | No mobile sync or external integration workflow is implemented. | This file |
| Configurable forms and project structures without hard-coded election-specific behavior | Partial | Projects and geography nodes are project-scoped, but geography types are a seeded fixed catalog and no form builder or configuration interface exists. | 05_Features Completed |
| Two-factor authentication, encryption, data export controls, and security monitoring | Pending | Sanctum bearer auth, password hashing, rate limits, and admin middleware exist. No 2FA or broader data encryption/export controls/security monitoring UI. | 05_Features Completed |
| Audit trail and user activity log | Partial | AuditService records selected auth/admin actions; audit query UI, full coverage, and audit management are absent. AuditService.php | 05_Features Completed |
| Backup, restore, recovery | Pending | No backup/restore workflow or UI in the application code. | This file |
| Reusable, configurable architecture for future elections/projects | Partial | Project records and project-scoped geography support multiple projects; geography type catalog is seeded, with no admin configuration UI. | 05_Features Completed |
| Future AI modules and extension points | Pending | No AI module or documented extension/plugin interface is present in the code. | This file |
| Membership management and wider organization management | Pending | No membership or organization module/routes/screens. | This file |

## Database and delivery gaps

- The SQL reference schema includes attendance, sync, assignment, and profile tables, but their presence does not implement their workflows. Several related models exist without controllers or routes.
- The project readme describes MySQL setup by importing field_management_final_schema.sql. The application defaults to SQLite when DB_CONNECTION is unset. Confirm and document the intended production setup when deployment work begins.
- The consolidated migration is guarded as testing-only. Its implementations of some profile/assignment/attendance/sync tables are simplified compared with the SQL dump. Do not treat running tests or seeing migration definitions as production schema verification.
- The web client has no project/geography management screens and no worker/officer field-operation workflows.
- The README claims a specific backend test count and passing state. That claim has not been verified during this documentation task; tests were not run.

## Scope note

The requirement document contains both a comprehensive feature list and a comparison with an earlier, smaller list. This tracker uses the comprehensive list as the target. It does not treat the earlier list as a second implementation requirement set.
