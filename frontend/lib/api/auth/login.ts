import { apiClient } from '../config';
import type { User } from '@/types';
import {
  setAccessToken,
  setRefreshToken,
  setUser,
  clearAuth,
  getUser as getStoredUser,
  getAccessToken as getStoredAccessToken,
} from '@/lib/helpers/storage';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export const login = async (
  credentials: LoginCredentials
): Promise<LoginResponse> => {
  const response = await apiClient.post<LoginResponse>(
    '/auth/login',
    credentials
  );

  const { user, accessToken, refreshToken } = response.data;

  setAccessToken(accessToken);
  setRefreshToken(refreshToken);
  setUser(user);

  return response.data;
};

export const logout = async (): Promise<void> => {
  const user = getStoredUser();

  if (user?._id) {
    try {
      await apiClient.post('/auth/logout', { userId: user._id });
    } catch (e) {
      console.error('Logout error', e);
    }
  }

  clearAuth();
};

export const getCurrentUser = (): User | null => {
  return getStoredUser();
};