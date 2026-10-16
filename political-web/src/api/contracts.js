/**
 * @file API Data Shapes & Contracts
 * 
 * Defines and documents the expected request payloads, response structures,
 * roles, and statuses based strictly on the Laravel 13 backend.
 */

/**
 * User Roles Enum
 * @readonly
 * @enum {string}
 */
export const RoleName = Object.freeze({
  ADMIN: 'ADMIN',
  OFFICER: 'OFFICER',
  WORKER: 'WORKER',
});

/**
 * Roles allowed for public self-registration
 * @type {string[]}
 */
export const PUBLIC_REGISTRABLE_ROLES = [
  RoleName.WORKER,
  RoleName.OFFICER,
];

/**
 * User Statuses Enum
 * @readonly
 * @enum {string}
 */
export const UserStatus = Object.freeze({
  PENDING: 'PENDING',
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  SUSPENDED: 'SUSPENDED',
  REJECTED: 'REJECTED',
});

/**
 * Registration Sources Enum
 * @readonly
 * @enum {string}
 */
export const RegistrationSource = Object.freeze({
  SELF_REGISTRATION: 'SELF_REGISTRATION',
  ADMIN_CREATED: 'ADMIN_CREATED',
  BULK_IMPORT: 'BULK_IMPORT',
});

/**
 * @typedef {Object} SafeUser
 * @property {number} id - User ID
 * @property {string} uuid - Public unique UUID
 * @property {string} full_name - User's full name
 * @property {string|null} email - Email address (optional)
 * @property {string} phone - Mobile phone number
 * @property {string} status - PENDING | ACTIVE | INACTIVE | SUSPENDED | REJECTED
 * @property {string} registration_source - SELF_REGISTRATION | ADMIN_CREATED | BULK_IMPORT
 * @property {string|null} [last_login_at] - ISO 8601 timestamp of last login
 * @property {string|null} [approved_by] - Admin user ID who approved the account (Admin view)
 * @property {string|null} [approved_at] - ISO 8601 timestamp of approval (Admin view)
 * @property {string|null} [rejection_reason] - Reason provided if rejected (Admin view)
 * @property {string} created_at - ISO 8601 timestamp of creation
 * @property {string[]} roles - Array of role names, e.g. ['ADMIN'] or ['WORKER']
 */

/**
 * @typedef {Object} RegisterRequestPayload
 * @property {string} full_name - Full name (max 150)
 * @property {string} phone - Mobile number (max 20, unique)
 * @property {string} [email] - Optional email address (unique)
 * @property {string} password - Password (min 8 chars, mixedCase, numbers)
 * @property {string} password_confirmation - Matching confirmation password
 * @property {('WORKER'|'OFFICER')} role - WORKER or OFFICER (ADMIN not self-registrable)
 */

/**
 * @typedef {Object} RegisterResponse
 * @property {string} message - Success message
 */

/**
 * @typedef {Object} LoginRequestPayload
 * @property {string} login - Email address or phone number
 * @property {string} password - Password
 */

/**
 * @typedef {Object} LoginResponse
 * @property {string} message - 'Login successful.'
 * @property {string} token - Sanctum plain text bearer token
 * @property {SafeUser} user - Authenticated user details
 */

/**
 * @typedef {Object} AuthMeResponse
 * @property {SafeUser} user - Current user details
 */

/**
 * @typedef {Object} ApiValidationError
 * @property {string} message - Validation failure message
 * @property {Object.<string, string[]>} errors - Field-level validation error messages
 */
