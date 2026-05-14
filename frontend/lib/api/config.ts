import axios from 'axios';
import { getAccessToken } from '@/lib/helpers/storage';

export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Intercepteur pour ajouter le token
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

// ✅ Intercepteur modifié pour gérer les 401 sans boucle
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        // ✅ Vérifier qu'on n'est pas déjà sur /login pour éviter la boucle
        const isOnLoginPage = window.location.pathname === '/login';
        
        // Nettoyer les tokens
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        
        // ✅ Supprimer aussi les cookies
        document.cookie = 'accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        
        // ✅ Rediriger seulement si pas déjà sur login
        if (!isOnLoginPage) {
          // Utiliser replace au lieu de href pour éviter la boucle
          window.location.replace('/login?session=expired');
        }
      }
    }
    return Promise.reject(error);
  }
);
