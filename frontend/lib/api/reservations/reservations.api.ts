// lib/api/reservations.ts
import { apiClient } from '../config';
import { Reservation } from '@/types';

export interface CreateReservationData {
  serviceId: string;
  startTime: string;
  duration: number;
  notes?: string;
}

export const reservationsApi = {
  // Mes réservations (client)
  getMyReservations: async (): Promise<Reservation[]> => {
    const response = await apiClient.get('/api/reservations/my');
    return response.data;
  },

  // Réservations du fournisseur
  getProviderReservations: async (): Promise<Reservation[]> => {
    const response = await apiClient.get('/api/reservations/provider');
    return response.data;
  },

  // Créer une réservation
  create: async (data: CreateReservationData): Promise<Reservation> => {
    const response = await apiClient.post('/api/reservations', data);
    return response.data;
  },

  // Confirmer une réservation
  confirm: async (id: string): Promise<Reservation> => {
    const response = await apiClient.post(`/api/reservations/${id}/confirm`);
    return response.data;
  },

  // Annuler une réservation
  cancel: async (id: string, reason?: string): Promise<Reservation> => {
    const response = await apiClient.post(`/api/reservations/${id}/cancel`, { reason });
    return response.data;
  },

  // Compléter une réservation
  complete: async (id: string): Promise<Reservation> => {
    const response = await apiClient.post(`/api/reservations/${id}/complete`);
    return response.data;
  },

  // Vérifier disponibilité
  getAvailability: async (serviceId: string, date: string): Promise<any[]> => {
    const response = await apiClient.get(`/api/reservations/availability/${serviceId}?date=${date}`);
    return response.data;
  },
};

export default reservationsApi;