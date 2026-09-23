'use client';

import { createContext, useContext, useRef, useState, useEffect, ReactNode, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';

interface User {
  id: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  isInitialized: boolean;
  getAccessToken: () => string | null;
  setAuth: (token: string, user: User) => void;
  clearAuth: () => Promise<void>;
  refreshToken: () => Promise<string>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

let refreshPromise: Promise<string> | null = null;

interface AccessTokenPayload {
  id: string;
  role: string;
}

function decodeAccessToken(token: string) {
  try {
    const { id, role } = jwtDecode<AccessTokenPayload>(token);
    return { id, role };
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const router = useRouter();

  const accessTokenRef = useRef<string | null>(null);

  const getAccessToken = useCallback(() => accessTokenRef.current, []);

  const refreshToken = useCallback(async (): Promise<string> => {
    if (refreshPromise) return refreshPromise;

    refreshPromise = (async () => {
      try {
        const currentToken = accessTokenRef.current;
        const headers: HeadersInit = { 'Content-Type': 'application/json' };
        if (currentToken) headers['Authorization'] = `Bearer ${currentToken}`;

        const refreshRes = await fetch(
          `${process.env.NEXT_PUBLIC_AUTH_API_URL}/api/auth/refresh`,
          { method: 'POST', credentials: 'include', headers, signal: AbortSignal.timeout(8000) }
        );

        if (!refreshRes.ok) throw new Error('Refresh failed');
        const refreshData = await refreshRes.json();
        const newAccessToken: string = refreshData.accessToken;

        const decoded = decodeAccessToken(newAccessToken);
        if (!decoded) throw new Error('Invalid token payload');

        accessTokenRef.current = newAccessToken;
        setAccessToken(newAccessToken);
        setUser(decoded);

        return newAccessToken;
      } catch (error) {
        accessTokenRef.current = null;
        setAccessToken(null);
        setUser(null);
        throw error;
      } finally {
        refreshPromise = null;
      }
    })();

    return refreshPromise;
  }, []);

  useEffect(() => {
    const initAuth = async () => {
      try {
        await refreshToken();
      } catch {
        accessTokenRef.current = null;
        setAccessToken(null);
        setUser(null);
      } finally {
        setIsInitialized(true);
      }
    };

    initAuth();
  }, [refreshToken]);

  const setAuth = useCallback((token: string, user: User) => {
    accessTokenRef.current = token;
    setAccessToken(token);
    setUser(user);
  }, []);

  const clearAuth = useCallback(async (): Promise<void> => {
    try {
      const token = accessTokenRef.current;
      await fetch(`${process.env.NEXT_PUBLIC_AUTH_API_URL}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
          'Content-Type': 'application/json',
        },
      });
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      accessTokenRef.current = null;
      setAccessToken(null);
      setUser(null);
      router.replace('/login');
    }
  }, [router]);

  return (
    <AuthContext.Provider value={{ user, accessToken, isInitialized, getAccessToken, setAuth, clearAuth, refreshToken }}>
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