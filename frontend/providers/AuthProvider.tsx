// frontend/providers/AuthProvider.tsx
'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { login as loginApi, register as registerApi, logout as logoutApi, getCurrentUser, type LoginCredentials, type RegisterData, type User } from '@/lib/api';

// 🆕 Fonctions pour gérer les cookies
const setCookie = (name: string, value: string, days: number = 7) => {
  if (typeof document === 'undefined') return;
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
};

const getCookie = (name: string): string | null => {
  if (typeof document === 'undefined') return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
};

const removeCookie = (name: string) => {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
};

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
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

const PUBLIC_ROUTES = ['/login', '/register', '/verify-email', '/about', '/search', '/', '/client/carte'];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const initAuth = () => {
      if (PUBLIC_ROUTES.includes(pathname) || pathname?.startsWith('/verify-email')) {
        setIsLoading(false);
        return;
      }
      
      const currentUser = getCurrentUser();
      setUser(currentUser);
      
      // 🆕 Vérifier que le cookie existe aussi
      const token = getCookie('accessToken');
      if (!token && currentUser) {
        // Le cookie a disparu, on le recrée
        const storedToken = localStorage.getItem('accessToken');
        if (storedToken) {
          setCookie('accessToken', storedToken, 7);
        }
      }
      
      setIsLoading(false);
    };
    initAuth();
  }, [pathname]);

  const login = async (credentials: LoginCredentials) => {
    const response = await loginApi(credentials);
    setUser(response.user);
    // 🆕 Stocker le token dans un cookie aussi
    setCookie('accessToken', response.accessToken, 7);
    setCookie('refreshToken', response.refreshToken, 30);
  };

  const register = async (data: RegisterData) => {
    const response = await registerApi(data);
    setUser(response.user);
    // 🆕 Stocker le token dans un cookie aussi
    if (response.accessToken) {
      setCookie('accessToken', response.accessToken, 7);
      setCookie('refreshToken', response.refreshToken, 30);
    }
  };

  const logout = async () => {
    await logoutApi();
    setUser(null);
    // 🆕 Supprimer les cookies
    removeCookie('accessToken');
    removeCookie('refreshToken');
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