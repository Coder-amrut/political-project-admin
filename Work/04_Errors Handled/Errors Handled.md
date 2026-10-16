# Errors Handled

## Confirmed fixed issues

No project bug with a verifiable problem, cause, applied fix, affected file, and confirmed current status was recorded in the supplied requirements or established by the inspected source. No fixed-issue entry is claimed here.

## Error and invalid-input handling present in code

The items below are safeguards implemented in the current code. The repository does not establish that each one was a previously discovered and fixed defect, so they are not listed as historical fixes.

| Problem handled by current behavior | Cause checked | Files | Current behavior/status |
|---|---|---|---|
| Invalid credentials or accounts that cannot sign in | Credentials are wrong or account status is not ACTIVE | field-management-api/app/Http/Controllers/Auth/AuthController.php | Returns unauthorized/forbidden responses; status checks are implemented. |
| Unauthorized access to admin routes | Request lacks a valid Sanctum identity or ADMIN role | field-management-api/routes/api.php; field-management-api/app/Http/Middleware/EnsureAdmin.php | Admin route group requires authentication and admin authorization. |
| Invalid project status change | Requested transition is not the next allowed workflow state | field-management-api/app/Enums/ProjectStatus.php; field-management-api/app/Http/Controllers/Admin/ProjectController.php | Rejects disallowed transitions with HTTP 409. |
| Invalid geography parent relationship | Parent is missing, belongs to a different project, is not at a higher level, or is self-referential during update | field-management-api/app/Http/Controllers/Admin/GeographyController.php | Returns validation-style 422 responses for these checks. |
| Validation errors from API calls | Backend request validation fails | field-management-api/app/Http/Requests; political-web/src/api/axios.js; political-web/src/pages/auth | Backend messages and field errors are surfaced to the relevant auth forms. |
| Invalid/expired client token | Stored bearer token is rejected by the API | political-web/src/api/axios.js; political-web/src/context/AuthContext.jsx | Client removes token and clears in-memory auth state on 401. |
| Audit write failure | Audit insert throws an exception | field-management-api/app/Services/AuditService.php | Exception is swallowed so the business operation continues. This is an intentional fail-safe, not proof that audit persistence succeeded. |

The phase feature tests include checks for several rejected requests and unauthorized roles. Their presence is evidence of expected behavior, not evidence that the tests passed in this documentation run or that a historical bug was fixed.
