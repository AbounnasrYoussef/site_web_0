'use client';

import { useCallback } from 'react';
import { useAuth } from '@/app/(zguellou)/providers/AuthProvider';

export function useAuthFetch() {
  const { getAccessToken, refreshToken, clearAuth } = useAuth();

  const authFetch = useCallback(
    async (input: string, init: RequestInit = {}, isRetry = false): Promise<Response> => {
      // Read the token at call time so the retry after a refresh uses the new one
      const token = getAccessToken();

      const headers: Record<string, string> = {
        ...(init.headers as Record<string, string> || {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      };

      if (!(init.body instanceof FormData)) {
        headers['Content-Type'] = 'application/json';
      }

      const res = await fetch(input, {
        ...init,
        credentials: 'include',
        headers,
      });

      if (res.status === 401 && !isRetry) {
        try {
          await refreshToken();
        } catch {
          await clearAuth();
          throw new Error('Session expired');
        }
        return authFetch(input, init, true);
      }

      return res;
    },
    [getAccessToken, refreshToken, clearAuth]
  );

  return authFetch;
}