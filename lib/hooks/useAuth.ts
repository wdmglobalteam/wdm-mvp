// --- filename: lib/hooks/useAuth.ts ---
/**
 * Client-side auth hook
 * Provides auth state and methods
 */

'use client';

import { useState, useEffect, useCallback } from 'react';

interface User {
  id: string;
  email?: string;
  email_verified?: boolean;
  [key: string]: unknown;
}

interface UseAuthResult {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  resendVerification: (email: string) => Promise<{ success: boolean; error?: string }>;
  refreshUser: () => Promise<void>;
}

export function useAuth(): UseAuthResult {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true); // ✅ true until session fetched
  const [error, setError] = useState<string | null>(null);

  // Fetch current user session
  const fetchUser = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/session', { cache: 'no-store' });
      const data = await res.json();
      setUser(data.user ?? null);
    } catch (err) {
      console.error('Failed to fetch user:', err);
      setUser(null);
      setError('Failed to fetch session');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  // Login
  const login = useCallback(async (email: string, password: string) => {
    setError(null);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) return { success: false, error: data.error };

      await fetchUser(); // refresh session after login
      return { success: true };
    } catch (err) {
      return { success: false, error: 'Network error' + err };
    }
  }, [fetchUser]);

  // Signup
  const signup = useCallback(async (email: string, password: string) => {
    setError(null);
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) return { success: false, error: data.error };
      return { success: true };
    } catch (err) {
      return { success: false, error: 'Network error' + err };
    }
  }, []);

  // Logout
  const logout = useCallback(async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
    } catch (err) {
      console.error('Logout failed:', err);
    }
  }, []);

  // Resend verification
  const resendVerification = useCallback(async (email: string) => {
    try {
      const res = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (!res.ok) return { success: false, error: data.error };
      return { success: true };
    } catch (err) {
      return { success: false, error: 'Network error' + err };
    }
  }, []);

  return {
    user,
    loading,
    error,
    login,
    signup,
    logout,
    resendVerification,
    refreshUser: fetchUser,
  };
}
