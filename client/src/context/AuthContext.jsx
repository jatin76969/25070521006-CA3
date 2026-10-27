import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as authApi from '../api/auth.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check current session on mount via HttpOnly cookie
  const checkAuth = useCallback(async () => {
    try {
      const data = await authApi.getMe();
      if (data.success && data.user) {
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (err) {
      // 401 simply means guest/not logged in, which is expected
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Login action
  const login = async (credentials) => {
    const data = await authApi.login(credentials);
    if (data.success && data.user) {
      setUser(data.user);
    }
    return data;
  };

  // Register action
  const register = async (userData) => {
    const data = await authApi.register(userData);
    if (data.success && data.user) {
      setUser(data.user);
    }
    return data;
  };

  // Logout action
  const logout = async () => {
    try {
      await authApi.logout();
    } finally {
      setUser(null);
    }
  };

  // Update local user state (e.g. after profile edit)
  const updateUser = (updatedFields) => {
    setUser((prev) => (prev ? { ...prev, ...updatedFields } : null));
  };

  const isAdmin = user?.role === 'admin';

  const value = {
    user,
    loading,
    isAdmin,
    login,
    register,
    logout,
    updateUser,
    refreshUser: checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
