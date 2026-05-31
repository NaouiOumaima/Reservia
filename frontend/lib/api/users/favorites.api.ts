// frontend/src/lib/api/users/favorites.api.ts
import { apiClient } from '../config';
import { Service } from '@/types';

export const favoritesApi = {
  /**
   * Récupère tous les services favoris de l'utilisateur connecté.
   */
  getFavorites: async (): Promise<Service[]> => {
    const response = await apiClient.get('/favorites');
    return response.data;
  },

  /**
   * Ajoute un service aux favoris.
   */
  add: async (serviceId: string): Promise<void> => {
    await apiClient.post('/favorites', { serviceId });
  },

  /**
   * Retire un service des favoris.
   */
  remove: async (serviceId: string): Promise<void> => {
    await apiClient.delete(`/favorites/${serviceId}`);
  },

  /**
   * Vérifie si un service est dans les favoris via l'endpoint dédié.
   */
  isFavorite: async (serviceId: string): Promise<boolean> => {
    try {
      const response = await apiClient.get(`/favorites/${serviceId}/check`);
      return response.data.isFavorite;
    } catch {
      return false;
    }
  },

  /**
   * Bascule l'état favori. Retourne true si ajouté, false si retiré.
   */
  toggle: async (serviceId: string): Promise<boolean> => {
    const current = await favoritesApi.isFavorite(serviceId);
    if (current) {
      await favoritesApi.remove(serviceId);
      return false;
    } else {
      await favoritesApi.add(serviceId);
      return true;
    }
  },
};