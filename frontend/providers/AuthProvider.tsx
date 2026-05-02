'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

const PUBLIC_ROUTES = [
  '/login',
  '/register',
  '/verify-email',
  '/about',
  '/search',
  '/',
  '/client/carte',
];

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const router = useRouter();
  const pathname = usePathname();

  // =========================
  // INIT AUTH
  // =========================
  useEffect(() => {
    const stored = localStorage.getItem('user');

    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        setUser(null);
      }
    }

    setIsLoading(false);
  }, []);

  // =========================
  // LOGIN
  // =========================
  const login = async (credentials: LoginCredentials) => {
    const res = await loginApi(credentials);

    setUser(res.user);

    // sync storage
    localStorage.setItem('user', JSON.stringify(res.user));
    localStorage.setItem('accessToken', res.accessToken);
    localStorage.setItem('refreshToken', res.refreshToken);
  };

  // =========================
  // REGISTER
  // =========================
  const register = async (data: RegisterData) => {
    const res = await registerApi(data);

    setUser(res.user);

    if (res.accessToken) {
      localStorage.setItem('user', JSON.stringify(res.user));
      localStorage.setItem('accessToken', res.accessToken);
      localStorage.setItem('refreshToken', res.refreshToken);
    }
  };

  // =========================
  // LOGOUT
  // =========================
  const logout = async () => {
    await logoutApi();

    setUser(null);

    localStorage.removeItem('user');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');

    router.push('/login');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};