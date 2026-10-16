import axios from 'axios';
import { getToken, removeToken } from '../utils/tokenStorage';

/**
 * Centralized Axios instance for the Field Management API.
 * Uses Sanctum opaque Bearer token authentication.
 */
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api',
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Request Interceptor: Attach Sanctum bearer token to outgoing requests
apiClient.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Normalized error extraction without obscuring backend messages
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const status = error.response ? error.response.status : null;
    const responseData = error.response ? error.response.data : null;

    const parsedError = {
      status,
      message: 'An unexpected error occurred. Please try again.',
      errors: null,
      raw: error,
    };

    if (responseData) {
      if (responseData.message) {
        parsedError.message = responseData.message;
      }
      if (responseData.errors) {
        parsedError.errors = responseData.errors;
      }
    } else if (error.message) {
      parsedError.message = error.message;
    }

    switch (status) {
      case 401:
        // Token is invalid, expired, or revoked
        if (getToken()) {
          removeToken();
          // Dispatch custom event to notify AuthContext to clear in-memory state
          window.dispatchEvent(new CustomEvent('auth:unauthorized'));
        }
        break;
      case 403:
        // Forbidden (e.g. pending approval, inactive status, or missing role)
        break;
      case 409:
        // Conflict / invalid state transition
        break;
      case 422:
        // Validation error
        break;
      case 429:
        // Rate limit exceeded (5/min login, 10/min register)
        if (!responseData?.message) {
          parsedError.message = 'Too many requests. Please wait a minute and try again.';
        }
        break;
      case 500:
        // Internal server error
        break;
      default:
        break;
    }

    return Promise.reject(parsedError);
  }
);

export default apiClient;
