// frontend/lib/api/auth/register.ts

import { apiClient } from '../config';
import { setAccessToken, setRefreshToken, setUser } from '../../helpers/storage';
import type {  LoginResponse } from './login';

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: 'client' | 'provider';
  phone?: string;
  businessName?: string;
}

export const register = async (data: RegisterData): Promise<LoginResponse> => {
  try {
    const response = await apiClient.post<LoginResponse>('/auth/register', data);
    const { accessToken, refreshToken, user } = response.data;

    // L'inscription nécessite généralement une vérification d'email : le backend
    // ne renvoie alors ni tokens ni user tant que le compte n'est pas confirmé.
    if (accessToken && refreshToken) {
      setAccessToken(accessToken);
      setRefreshToken(refreshToken);
    }
    if (user) {
      setUser(user);
    }

    return response.data;
  } catch (error: any) {
    console.error('Register error:', error.response?.data?.message || error.message);
    throw error;
  }
};