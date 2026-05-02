import { apiClient } from '../config';
import { Reservation } from '@/types';

export interface CreateReservationData {
  serviceId: string;
  startTime: string;
  duration: number;
  notes?: string;
}

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

  getAvailability: async (serviceId: string, date: string): Promise<any[]> => {
    const response = await apiClient.get(`/reservations/availability/${serviceId}?date=${date}`);
    return response.data;
  },
};

export default reservationsApi;