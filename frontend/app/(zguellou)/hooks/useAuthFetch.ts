'use client';

import { useCallback } from 'react';
import { useAuth } from '@/app/(zguellou)/providers/AuthProvider';

const TOKEN_KEY = 'kharita_access_token';

export function useAuthFetch() {
  const { refreshToken, clearAuth } = useAuth();

  const authFetch = useCallback(
    async (input: string, init: RequestInit = {}, isRetry = false): Promise<Response> => {
      const token = typeof window !== 'undefined' ? sessionStorage.getItem(TOKEN_KEY) : null;

      const res = await fetch(input, {
        ...init,
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(init.headers || {}),
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (res.status === 401 && !isRetry) {
        try {
          await refreshToken();
        } catch {
          await clearAuth();
          throw new Error('Session expired');
        }
        return authFetch(input, init, true); // retry once with the fresh token
      }

      return res;
    },
    [refreshToken, clearAuth]
  );

  return authFetch;
}