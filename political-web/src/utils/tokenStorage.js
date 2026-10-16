/**
 * Token Storage Utility
 * 
 * Manages client-side storage of the Laravel Sanctum bearer token.
 * Note: Sanctum tokens are opaque database-backed bearer tokens, NOT JWTs.
 * Do not attempt to parse or decode the token payload.
 */

const TOKEN_KEY = 'field_management_token';

/**
 * Retrieve the stored Sanctum bearer token.
 * @returns {string|null} The token string or null if not found.
 */
export const getToken = () => {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch (error) {
    console.error('Error reading auth token from storage:', error);
    return null;
  }
};

/**
 * Store the Sanctum bearer token.
 * @param {string} token - The raw plain-text token received from the backend API.
 */
export const setToken = (token) => {
  try {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    }
  } catch (error) {
    console.error('Error saving auth token to storage:', error);
  }
};

/**
 * Remove the stored Sanctum bearer token.
 */
export const removeToken = () => {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch (error) {
    console.error('Error removing auth token from storage:', error);
  }
};

/**
 * Check if a token currently exists in storage.
 * @returns {boolean}
 */
export const hasToken = () => {
  return Boolean(getToken());
};
