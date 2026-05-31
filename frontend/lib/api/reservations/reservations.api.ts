// frontend/lib/api/reservations.ts
import { apiClient } from '../config';
import { CreateReservationData, Reservation } from './types';

export const reservationsApi = {
  getMyReservations: async (): Promise<Reservation[]> => {
    const response = await apiClient.get('/reservations/my');
    return response.data;
  },

  getProviderReservations: async (): Promise<Reservation[]> => {
    const response = await apiClient.get('/reservations/provider');
    return response.data;
  },

  create: async (data: CreateReservationData): Promise<Reservation> => {
    const response = await apiClient.post('/reservations', data);
    return response.data;
  },

  confirm: async (id: string): Promise<Reservation> => {
    const response = await apiClient.post(`/reservations/${id}/confirm`);
    return response.data;
  },

  cancel: async (id: string, reason?: string): Promise<Reservation> => {
    const response = await apiClient.post(`/reservations/${id}/cancel`, { reason });
    return response.data;
  },

  complete: async (id: string): Promise<Reservation> => {
    const response = await apiClient.post(`/reservations/${id}/complete`);
    return response.data;
  },

  accept: async (id: string): Promise<Reservation> => {
    const response = await apiClient.post(`/reservations/${id}/accept`);
    return response.data;
  },

  reject: async (id: string, reason?: string): Promise<Reservation> => {
    const response = await apiClient.post(`/reservations/${id}/reject`, { reason });
    return response.data;
  },

  // ✅ Modifié: Vérifier la disponibilité d'une date/heure spécifique
  checkAvailability: async (serviceId: string, dateTime: string): Promise<{ available: boolean; message: string }> => {
    const response = await apiClient.get(`/reservations/availability`, {
      params: { serviceId, dateTime }
    });
    return response.data;
  },

  // ✅ Optionnel: Obtenir tous les créneaux disponibles d'une journée
  getAvailableSlots: async (serviceId: string, date: string): Promise<any[]> => {
    const response = await apiClient.get(`/reservations/available-slots`, {
      params: { serviceId, date }
    });
    return response.data;
  },
};

export default reservationsApi;