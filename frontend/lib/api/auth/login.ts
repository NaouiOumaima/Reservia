// frontend/lib/api/auth/login.ts

import { apiClient } from '../config';
import { 
  getAccessToken as getStoredAccessToken, 
  getRefreshToken as getStoredRefreshToken,
  setAccessToken, 
  setRefreshToken, 
  setUser, 
  clearAuth,
  getUser as getStoredUser
} from '@/lib/helpers/storage';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface User {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'client' | 'provider' | 'admin';
  phone?: string;
  profileImage?: string;
  isActive: boolean;
}

export interface LoginResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export const login = async (credentials: LoginCredentials): Promise<LoginResponse> => {
  try {
    const response = await apiClient.post<LoginResponse>('/auth/login', credentials);
    const { accessToken, refreshToken, user } = response.data;

    setAccessToken(accessToken);
    setRefreshToken(refreshToken);
    setUser(user);

    return response.data;
  } catch (error: any) {
    console.error('Login error:', error.response?.data?.message || error.message);
    throw error;
  }
};

export const logout = async (): Promise<void> => {
  const userId = getStoredUser()?._id;
  if (userId) {
    try {
      await apiClient.post('/auth/logout', { userId });
    } catch (error) {
      console.error('Logout API error:', error);
    }
  }
  clearAuth();
};

export const getCurrentUser = (): User | null => {
  return getStoredUser();
};

export const isAuthenticated = (): boolean => {
  return !!getStoredAccessToken() && !!getStoredUser();
};