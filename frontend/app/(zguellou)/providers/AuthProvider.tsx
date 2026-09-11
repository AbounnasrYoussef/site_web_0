'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  isLoading: boolean;
  isInitialized: boolean;
  setAuth: (token: string, user: User) => void;
  clearAuth: () => void;
  refreshToken: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEYS = {
  ACCESS_TOKEN: 'kharita_access_token',
};

function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null;
  return sessionStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
}

function setStoredToken(token: string | null) {
  if (typeof window === 'undefined') return;
  if (token) {
    sessionStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token);
  } else {
    sessionStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
  }
}

let refreshPromise: Promise<void> | null = null;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(() => getStoredToken());
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const router = useRouter();

  const refreshToken = useCallback(async (): Promise<void> => {
    if (refreshPromise) 
      return refreshPromise;

    refreshPromise = (async () => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      try {
        const currentToken = getStoredToken();

        const headers: HeadersInit = { 'Content-Type': 'application/json' };
        if (currentToken) headers['Authorization'] = `Bearer ${currentToken}`;

        const refreshRes = await fetch(
          `${process.env.NEXT_PUBLIC_AUTH_API_URL}/api/auth/refresh`,
          {
            method: 'POST',
            credentials: 'include',
            headers,
            signal: controller.signal,
          }
        );

        clearTimeout(timeoutId);

        if (!refreshRes.ok) {
          throw new Error('Refresh failed');
        }

        const refreshData = await refreshRes.json();
        const newAccessToken = refreshData.accessToken;

        if (refreshData.user) {
          setAccessToken(newAccessToken);
          setStoredToken(newAccessToken);
          setUser(refreshData.user);
        } else {
          const validateRes = await fetch(
            `${process.env.NEXT_PUBLIC_AUTH_API_URL}/api/auth/validate`,
            {
              method: 'GET',
              credentials: 'include',
              headers: {
                'Authorization': `Bearer ${newAccessToken}`,
                'Content-Type': 'application/json',
              },
              signal: controller.signal,
            }
          );

          clearTimeout(timeoutId);

          if (!validateRes.ok) {
            throw new Error('Validation failed');
          }

          const validateData = await validateRes.json();

          setAccessToken(newAccessToken);
          setStoredToken(newAccessToken);
          setUser(validateData.user);
        }
      } catch (error) {
        setAccessToken(null);
        setUser(null);
        setStoredToken(null);
        throw error;
      } finally {
        clearTimeout(timeoutId);
        refreshPromise = null;
      }
    })();

    return refreshPromise;
  }, []);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = getStoredToken();

      if (storedToken) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 8000);

          const res = await fetch(
            `${process.env.NEXT_PUBLIC_AUTH_API_URL}/api/auth/validate`,
            {
              method: 'GET',
              credentials: 'include',
              headers: {
                'Authorization': `Bearer ${storedToken}`,
                'Content-Type': 'application/json',
              },
              signal: controller.signal,
            }
          );

          clearTimeout(timeoutId);

          if (res.ok) {
            const data = await res.json();
            setAccessToken(storedToken);
            setUser(data.user);
            setIsInitialized(true);
            setIsLoading(false);
            return;
          }
        } catch (error) {}
      }

      try {
        await refreshToken();
      } catch {
        setAccessToken(null);
        setUser(null);
        setStoredToken(null);
      } finally {
        setIsInitialized(true);
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const setAuth = (token: string, user: User) => {
    setAccessToken(token);
    setUser(user);
    setStoredToken(token);
  };

  const clearAuth = useCallback(async (): Promise<void> => {
    const token = getStoredToken();

    const headers: HeadersInit = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    try {
      await fetch(`${process.env.NEXT_PUBLIC_AUTH_API_URL}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include',
        headers,
        signal: controller.signal,
      });
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      clearTimeout(timeoutId);
      setAccessToken(null);
      setUser(null);
      setStoredToken(null);
      router.replace('/login');
    }
  }, [router]);

  return (
    <AuthContext.Provider
      value={{ user, accessToken, isLoading, isInitialized, setAuth, clearAuth, refreshToken }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}