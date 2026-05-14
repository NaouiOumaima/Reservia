// frontend/providers/AuthProvider.tsx
'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  login as loginApi,
  register as registerApi,
  logout as logoutApi,
  type LoginCredentials,
  type RegisterData,
  type User,
} from '@/lib/api';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  refreshAuth: () => void;
  updateUser: (updatedUser: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

function setCookie(name: string, value: string, days = 7) {
  const expires = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toUTCString();
  document.cookie = `${name}=${value}; path=/; expires=${expires}; SameSite=Lax`;
}

function deleteCookie(name: string) {
  document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
}

// ✅ NOUVEAU : Fonction pour nettoyer tous les tokens
function clearAllTokens() {
  localStorage.removeItem('user');
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  deleteCookie('accessToken');
  deleteCookie('token');
}

function getInitialUser(): User | null {
  if (typeof window === 'undefined') return null;
  try {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(getInitialUser);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Sync multi-onglets
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'user') {
        try { setUser(e.newValue ? JSON.parse(e.newValue) : null); }
        catch { setUser(null); }
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const refreshAuth = () => {
    try {
      const stored = localStorage.getItem('user');
      setUser(stored ? JSON.parse(stored) : null);
    } catch {
      setUser(null);
    }
  };

  const updateUser = useCallback((updatedUser: User) => {
    setUser(updatedUser);
    if (typeof window !== 'undefined') {
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  }, []);

  const login = async (credentials: LoginCredentials) => {
    try {
      const res = await loginApi(credentials);
      setUser(res.user);
      localStorage.setItem('user', JSON.stringify(res.user));
      localStorage.setItem('accessToken', res.accessToken);
      localStorage.setItem('refreshToken', res.refreshToken);
      setCookie('accessToken', res.accessToken, 7);
    } catch (error: any) {
      // ✅ Si erreur 401, nettoyer les tokens
      if (error?.response?.status === 401) {
        clearAllTokens();
        setUser(null);
      }
      throw error;
    }
  };

  const register = async (data: RegisterData) => {
    try {
      const res = await registerApi(data);
      setUser(res.user);
      if (res.accessToken) {
        localStorage.setItem('user', JSON.stringify(res.user));
        localStorage.setItem('accessToken', res.accessToken);
        localStorage.setItem('refreshToken', res.refreshToken);
        setCookie('accessToken', res.accessToken, 7);
      }
    } catch (error: any) {
      // ✅ Si erreur 401, nettoyer les tokens
      if (error?.response?.status === 401) {
        clearAllTokens();
        setUser(null);
      }
      throw error;
    }
  };

  const logout = async () => {
    try {
      await logoutApi();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      clearAllTokens();
      setUser(null);
      router.push('/login');
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      isAuthenticated: !!user,
      login,
      register,
      logout,
      refreshAuth,
      updateUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
};