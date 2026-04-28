// lib/api/services/services.api.ts
import { apiClient } from '../config';
import { Service } from '@/lib/api';

export interface CreateServiceData {
  name: string;
  category: string;
  description: string;
  basePrice: number;
  discountPrice?: number;
  duration: number;
  images?: string[];
  location: {
    coordinates: [number, number];
    address: string;
    city: string;
    governorate: string;
    postalCode?: string;
  };
}

export interface ServiceFilters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  limit?: number;
  skip?: number;
}

export const servicesApi = {
  getAll: async (filters?: ServiceFilters): Promise<Service[]> => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) params.append(key, String(value));
      });
    }
    const response = await apiClient.get(`/api/services${params.toString() ? `?${params}` : ''}`);
    return response.data;
  },

  getByProvider: async (): Promise<Service[]> => {
const response = await apiClient.get('/api/services/provider');
    return response.data;
  },

  getById: async (id: string): Promise<Service> => {
    const response = await apiClient.get(`/api/services/${id}`);
    return response.data;
  },

// ✅ Correct
getNearby: async (lng: number, lat: number, radius?: number): Promise<Service[]> => {
  const params = new URLSearchParams({ lng: String(lng), lat: String(lat) });
  if (radius) params.append('radius', String(radius));
  const response = await apiClient.get(`/api/services/nearby?${params}`);
  return response.data;
},

  create: async (data: CreateServiceData): Promise<Service> => {
    const response = await apiClient.post('/api/services', data);
    return response.data;
  },

  update: async (id: string, data: Partial<CreateServiceData>): Promise<Service> => {
    const response = await apiClient.put(`/api/services/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/api/services/${id}`);
  },

  toggleActive: async (id: string): Promise<Service> => {
    const response = await apiClient.patch(`/api/services/${id}/toggle-active`, {});
    return response.data;
  },
};