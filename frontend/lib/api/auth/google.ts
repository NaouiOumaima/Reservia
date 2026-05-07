import { apiClient } from '../config';
import { setAccessToken, setRefreshToken, setUser } from '../../helpers/storage';
import type { LoginResponse } from './login';

export const googleLogin = async (accessToken: string, refreshToken: string): Promise<LoginResponse> => {
  try {
    // Optionnel: Vous pouvez appeler un endpoint pour vérifier/vérifier l'utilisateur
    const response = await apiClient.post<LoginResponse>('/auth/google/verify', {
      accessToken,
      refreshToken,
    });
    
    const { user } = response.data;
    setAccessToken(accessToken);
    setRefreshToken(refreshToken);
    setUser(user);
    
    return response.data;
  } catch (error: any) {
    console.error('Google login error:', error.response?.data?.message || error.message);
    throw error;
  }
};