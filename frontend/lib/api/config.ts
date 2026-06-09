// frontend/lib/api/client.ts
import axios from 'axios';
import { getAccessToken } from '@/lib/helpers/storage';

export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 180000,
  withCredentials: true,
});

// Intercepteur pour ajouter le token JWT uniquement
apiClient.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Intercepteur pour gérer les erreurs 401
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Gérer les erreurs 401 (session expirée)
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        const isOnLoginPage = window.location.pathname === '/login';
        
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        
        if (!isOnLoginPage) {
          window.location.replace('/login?session=expired');
        }
      }
    }
    
    return Promise.reject(error);
  }
);