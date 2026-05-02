import { apiClient } from '../config';
import { Service } from '@/types';

export const favoritesApi = {
  getFavorites: async (): Promise<Service[]> => {
    const response = await apiClient.get('/users/favorites');
    return response.data;
  },

  add: async (serviceId: string): Promise<void> => {
    await apiClient.post('/users/favorites', { serviceId });
  },

  remove: async (serviceId: string): Promise<void> => {
    await apiClient.delete(`/users/favorites/${serviceId}`);
  },

  isFavorite: async (serviceId: string): Promise<boolean> => {
    const favorites = await favoritesApi.getFavorites();
    return favorites.some((f: Service) => f._id === serviceId);
  },
};