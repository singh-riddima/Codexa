import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import api from '@/api/client';
import type { AuthUser } from '@/types';

type AuthContextValue = {
  user: AuthUser | null;
  token: string | null;
  isReady: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<AuthUser>;
  signup: (payload: { name: string; email: string; password: string }, rememberMe?: boolean) => Promise<AuthUser>;
  logout: () => void;
  deleteAccount: () => Promise<void>;
  refreshUser: () => Promise<AuthUser | null>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  function persistSession(sessionUser: AuthUser, sessionToken: string, rememberMe = true) {
    setUser(sessionUser);
    setToken(sessionToken);
    if (rememberMe) {
      localStorage.setItem('codexa-user', JSON.stringify(sessionUser));
      localStorage.setItem('codexa-token', sessionToken);
      sessionStorage.removeItem('codexa-user');
      sessionStorage.removeItem('codexa-token');
      return;
    }

    sessionStorage.setItem('codexa-user', JSON.stringify(sessionUser));
    sessionStorage.setItem('codexa-token', sessionToken);
    localStorage.removeItem('codexa-user');
    localStorage.removeItem('codexa-token');
  }

  useEffect(() => {
    let isMounted = true;

    const bootstrapSession = async () => {
      const storedToken = localStorage.getItem('codexa-token') ?? sessionStorage.getItem('codexa-token');
      const storedUser = localStorage.getItem('codexa-user') ?? sessionStorage.getItem('codexa-user');
      const rememberMe = Boolean(localStorage.getItem('codexa-token'));

      if (!storedToken) {
        if (storedUser) {
          setUser(JSON.parse(storedUser) as AuthUser);
        }
        if (isMounted) setIsReady(true);
        return;
      }

      try {
        const { data } = await api.get('/auth/me');
        if (!isMounted) return;
        persistSession(data.user as AuthUser, storedToken, rememberMe);
      } catch {
        if (!isMounted) return;
        if (storedUser) {
          setUser(JSON.parse(storedUser) as AuthUser);
          setToken(storedToken);
        }
      } finally {
        if (isMounted) setIsReady(true);
      }
    };

    void bootstrapSession();

    return () => {
      isMounted = false;
    };
  }, []);

  const clearStoredIdentity = () => {
    const storageKeys = [
      'codexa-user',
      'codexa-token',
      'codexa-onboard',
      'codexa-onboard-completed'
    ];

    storageKeys.forEach((key) => {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    });

    const onboardingKeysToRemove: string[] = [];
    for (let index = 0; index < localStorage.length; index += 1) {
      const key = localStorage.key(index);
      if (key?.startsWith('codexa-onboard-completed:') || key?.startsWith('codexa-onboard:')) {
        onboardingKeysToRemove.push(key);
      }
    }
    onboardingKeysToRemove.forEach((key) => localStorage.removeItem(key));
  };

  const value = useMemo<AuthContextValue>(() => ({
    user,
    token,
    isReady,
    login: async (email, password, rememberMe = true) => {
      const { data } = await api.post('/auth/login', { email, password });
      persistSession(data.user, data.token, rememberMe);
      return data.user as AuthUser;
    },
    signup: async (payload, rememberMe = true) => {
      const { data } = await api.post('/auth/signup', payload);
      persistSession(data.user, data.token, rememberMe);
      return data.user as AuthUser;
    },
    logout: () => {
      setUser(null);
      setToken(null);
      clearStoredIdentity();
    },
    deleteAccount: async () => {
      if (!token) {
        clearStoredIdentity();
        setUser(null);
        setToken(null);
        return;
      }

      try {
        await api.delete('/auth/me');
      } finally {
        setUser(null);
        setToken(null);
        clearStoredIdentity();
      }
    },
    refreshUser: async () => {
      if (!token) return null;
      const { data } = await api.get('/auth/me');
      const rememberMe = Boolean(localStorage.getItem('codexa-token'));
      persistSession(data.user as AuthUser, token, rememberMe);
      return data.user as AuthUser;
    }
  }), [isReady, token, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}