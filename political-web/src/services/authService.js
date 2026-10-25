import apiClient from '../api/axios';

/**
 * Auth Service
 * Strictly handles HTTP communication with the Laravel authentication endpoints.
 */

/**
 * Register a new Worker or Officer account.
 * Endpoint: POST /api/auth/register
 * 
 * @param {Object} data
 * @param {string} data.full_name
 * @param {string} data.phone
 * @param {string} [data.email]
 * @param {string} data.password
 * @param {string} data.password_confirmation
 * @param {('WORKER'|'OFFICER')} data.role
 * @returns {Promise<{message: string}>}
 */
export const registerUser = async (data) => {
  const response = await apiClient.post('/auth/register', data);
  return response.data;
};

/**
 * Authenticate with email/phone and password.
 * Endpoint: POST /api/auth/login
 * 
 * @param {Object} credentials
 * @param {string} credentials.login - Email address or mobile phone number
 * @param {string} credentials.password - Plain text password
 * @returns {Promise<{message: string, token: string, user: Object}>}
 */
export const loginUser = async (credentials) => {
  const response = await apiClient.post('/auth/login', credentials);
  return response.data;
};

/**
 * Developer quick login without password.
 * Endpoint: POST /api/auth/dev-login
 * 
 * @param {('ADMIN'|'OFFICER'|'WORKER')} role
 * @returns {Promise<{message: string, token: string, user: Object}>}
 */
export const devLoginUser = async (role) => {
  const response = await apiClient.post('/auth/dev-login', { role });
  return response.data;
};

/**
 * Invalidate the current Sanctum token on the server.
 * Endpoint: POST /api/auth/logout
 * 
 * @returns {Promise<{message: string}>}
 */
export const logoutUser = async () => {
  const response = await apiClient.post('/auth/logout');
  return response.data;
};

/**
 * Fetch the authenticated user's profile and roles.
 * Endpoint: GET /api/auth/me
 * 
 * @returns {Promise<Object>} SafeUser object
 */
export const getCurrentUser = async () => {
  const response = await apiClient.get('/auth/me');
  return response.data.user;
};

/**
 * Send OTP to phone number
 * Endpoint: POST /api/auth/send-otp
 */
export const sendOtp = async (phone) => {
  const response = await apiClient.post('/auth/send-otp', { phone });
  return response.data;
};

/**
 * Verify OTP
 * Endpoint: POST /api/auth/verify-otp
 */
export const verifyOtp = async (phone, otp) => {
  const response = await apiClient.post('/auth/verify-otp', { phone, otp });
  return response.data;
};
