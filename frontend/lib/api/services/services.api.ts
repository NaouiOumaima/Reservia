import { apiClient } from '../config';
import { CreateServiceData, Service, ServiceFilters, UpsertLocationData } from '@/lib/api/services/types';



export const servicesApi = {
  getAll: async (filters?: ServiceFilters): Promise<Service[]> => {
    const params = new URLSearchParams();

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) params.append(key, String(value));
      });
    }

    const response = await apiClient.get(`/services${params.toString() ? `?${params}` : ''}`);
    return response.data;
  },

  getByProvider: async (): Promise<Service[]> => {
    const response = await apiClient.get('/services/provider');
    // ✅ S'assurer que response.data est un tableau
    return Array.isArray(response.data) ? response.data : [];
  },

  getById: async (id: string): Promise<Service> => {
    const response = await apiClient.get(`/services/${id}`);
    return response.data;
  },

  getNearby: async (lng: number, lat: number, radius?: number): Promise<Service[]> => {
    const params = new URLSearchParams({
      lng: String(lng),
      lat: String(lat),
    });

    if (radius) params.append('radius', String(radius));

    const response = await apiClient.get(`/services/nearby?${params}`);
    return response.data;
  },

  create: async (data: CreateServiceData): Promise<Service> => {
    const response = await apiClient.post('/services', data);
    return response.data;
  },

  update: async (id: string, data: Partial<CreateServiceData>): Promise<Service> => {
    const response = await apiClient.put(`/services/${id}`, data);
    return response.data;
  },

  upsertLocation: async (data: UpsertLocationData): Promise<{ action: string; service: Service }> => {
    const response = await apiClient.put('/services/location/upsert', data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/services/${id}`);
  },

  toggleActive: async (id: string): Promise<Service> => {
    const response = await apiClient.patch(`/services/${id}/toggle-active`, {});
    return response.data;
  },
  getPendingServices: async (): Promise<Service[]> => {
    const response = await apiClient.get('/services/admin/pending');
    return response.data;
  },

  getPendingCount: async (): Promise<number> => {
    const response = await apiClient.get('/services/admin/pending/count');
    return response.data.count;
  },

  approveService: async (serviceId: string): Promise<Service> => {
    const response = await apiClient.patch(`/services/admin/${serviceId}/approve`);
    return response.data;
  },

  rejectService: async (serviceId: string, reason: string): Promise<Service> => {
    const response = await apiClient.patch(`/services/admin/${serviceId}/reject`, { reason });
    return response.data;
  },
    getAllAdmin: async (): Promise<Service[]> => {
    const response = await apiClient.get('/services/admin/all');
    return response.data;
  },
};
