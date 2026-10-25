import React, { createContext, useState, useEffect, useCallback } from 'react';
import { getToken, setToken, removeToken, hasToken } from '../utils/tokenStorage';
import * as authService from '../services/authService';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize and restore auth state on mount
  const restoreAuth = useCallback(async () => {
    if (!hasToken()) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser?.user || currentUser);
    } catch (error) {
      console.warn('Authentication token expired or invalid:', error.message);
      removeToken();
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    restoreAuth();

    // Listen for global 401 unauthorized events from Axios interceptor
    const handleUnauthorized = () => {
      setUser(null);
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => {
      window.removeEventListener('auth:unauthorized', handleUnauthorized);
    };
  }, [restoreAuth]);

  /**
   * Log in user, save Sanctum token, and set authenticated user state.
   */
  const login = async (credentials) => {
    const data = await authService.loginUser(credentials);
    if (data.token) {
      setToken(data.token);
    }
    if (data.user) {
      setUser(data.user);
    }
    return data;
  };

  /**
   * Quick developer login without password
   */
  const devLogin = async (role) => {
    const data = await authService.devLoginUser(role);
    if (data.token) {
      setToken(data.token);
    }
    if (data.user) {
      setUser(data.user);
    }
    return data;
  };

  /**
   * Register a new user account.
   */
  const register = async (userData) => {
    const data = await authService.registerUser(userData);
    if (data.token) {
      setToken(data.token);
    }
    if (data.user) {
      setUser(data.user);
    }
    return data;
  };

  /**
   * Verify OTP and optionally log in if user token returned
   */
  const verifyAndLoginOtp = async (phone, otp) => {
    const data = await authService.verifyOtp(phone, otp);
    if (data.token) {
      setToken(data.token);
    }
    if (data.user) {
      setUser(data.user);
    }
    return data;
  };

  /**
   * Log out user, invalidate token on server, and clear local state.
   */
  const logout = async () => {
    try {
      if (hasToken()) {
        await authService.logoutUser();
      }
    } catch (error) {
      console.warn('Server logout error (clearing local session):', error.message);
    } finally {
      removeToken();
      setUser(null);
    }
  };

  /**
   * Refresh current user profile from server.
   */
  const refreshUser = async () => {
    if (!hasToken()) {
      setUser(null);
      return null;
    }
    try {
      const currentUser = await authService.getCurrentUser();
      const normalizedUser = currentUser?.user || currentUser;
      setUser(normalizedUser);
      return normalizedUser;
    } catch (error) {
      removeToken();
      setUser(null);
      throw error;
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated: Boolean(user),
    login,
    devLogin,
    register,
    verifyAndLoginOtp,
    logout,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
