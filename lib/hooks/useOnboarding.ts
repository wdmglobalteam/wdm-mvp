// --- filename: lib/hooks/useOnboarding.ts ---
/**
 * Client-side onboarding hook
 * Manages onboarding state and progress
 */

'use client';

import { useState, useCallback } from 'react';

// interface OnboardingData {
//   step: number;
//   data: Record<string, unknown>;
// }

interface UseOnboardingResult {
  loading: boolean;
  error: string | null;
  saveStep: (step: number, data: Record<string, unknown>) => Promise<{ success: boolean; error?: string }>;
  checkConflict: (params: { matricNumber?: string; whatsappNumber?: string }) => Promise<{ conflict: boolean; field?: string }>;
  uploadAvatar: (base64: string, filename: string, contentType: string) => Promise<{ success: boolean; url?: string; error?: string }>;
  completeOnboarding: () => Promise<{ success: boolean; error?: string }>;
}

export function useOnboarding(): UseOnboardingResult {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const saveStep = useCallback(async (step: number, data: Record<string, unknown>) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/onboarding/save-step', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ step, data }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error);
        return { success: false, error: result.error };
      }

      return { success: true };
    } catch (err) {
      const errorMsg = 'Network error' + err;
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, []);

  const checkConflict = useCallback(async (params: { matricNumber?: string; whatsappNumber?: string }) => {
    try {
      const response = await fetch('/api/onboarding/check-conflict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });

      const result = await response.json();
      return result;
    } catch (err) {
      const errorMsg = 'Network error' + err;
      setError(errorMsg);
      return { conflict: false };
    }
  }, []);

  const uploadAvatar = useCallback(async (base64: string, filename: string, contentType: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/onboarding/upload-avatar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ base64, filename, contentType }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error);
        return { success: false, error: result.error };
      }

      return { success: true, url: result.url };
    } catch (err) {
      const errorMsg = 'Network error' + err;
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, []);

  const completeOnboarding = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/onboarding/complete', {
        method: 'POST',
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error);
        return { success: false, error: result.error };
      }

      return { success: true };
    } catch (err) {
      const errorMsg = 'Network error' + err;
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    saveStep,
    checkConflict,
    uploadAvatar,
    completeOnboarding,
  };
}