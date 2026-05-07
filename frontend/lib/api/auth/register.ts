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
    // ✅ Ajouter /api/ devant la route
    const response = await apiClient.post<LoginResponse>('/api/auth/register', data);
    const { accessToken, refreshToken, user } = response.data;

    setAccessToken(accessToken);
    setRefreshToken(refreshToken);
    setUser(user);

    return response.data;
  } catch (error: any) {
    console.error('Register error:', error.response?.data?.message || error.message);
    throw error;
  }
};