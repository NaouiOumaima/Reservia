// frontend/lib/api/advertisements/advertisements.api.ts

import { apiClient } from '../config';
import { Advertisement, CreateAdvertisementData, AdvertisementsResponse } from './types';

export const advertisementsApi = {
  // Créer une annonce
  create: async (data: CreateAdvertisementData): Promise<Advertisement> => {
    const response = await apiClient.post('/advertisements', data);
    return response.data;
  },

  // Récupérer les annonces du fournisseur connecté
  getMyAdvertisements: async (): Promise<Advertisement[]> => {
    const response = await apiClient.get('/advertisements/provider');
    return response.data;
  },

  // Récupérer une annonce par ID
  getById: async (id: string): Promise<Advertisement> => {
    const response = await apiClient.get(`/advertisements/${id}`);
    return response.data;
  },

  // Supprimer une annonce
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/advertisements/${id}`);
  },
};