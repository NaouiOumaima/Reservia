// lib/api/services/services.api.ts

import { getUser } from '@/lib/helpers/storage';
import { apiClient } from '../config';
import { BackendServiceSlot, CreateServiceData, Service, ServiceFilters, ServiceSlot, UpsertLocationData } from './types';

export const servicesApi = {

  // ==================== LECTURE ====================

  getAll: async (filters?: ServiceFilters): Promise<{ services: Service[]; total: number }> => {
    const params = new URLSearchParams();
    params.append('_t', Date.now().toString());
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) params.append(key, String(value));
      });
    }
    const response = await apiClient.get(`/services${params.toString() ? `?${params}` : ''}`);
    return response.data;
  },

  getByProvider: async (): Promise<Service[]> => {
    const response = await apiClient.get(`/services/provider?_t=${Date.now()}`);
    return Array.isArray(response.data) ? response.data : [];
  },

  getById: async (id: string): Promise<Service> => {
    const response = await apiClient.get(`/services/${id}?_t=${Date.now()}`);
    return response.data;
  },

  getNearby: async (
    lng: number,
    lat: number,
    radius?: number,
    category?: string,
  ): Promise<Service[]> => {
    const params = new URLSearchParams({
      lng: String(lng),
      lat: String(lat),
      _t: Date.now().toString(),
    });
    if (radius) params.append('radius', String(radius));
    if (category && category !== '') params.append('category', category);
    const response = await apiClient.get(`/services/nearby?${params}`);
    return response.data;
  },

  searchByText: async (
    searchTerm: string,
    lng?: number,
    lat?: number,
    radius?: number,
    category?: string,
  ): Promise<Service[]> => {
    const params = new URLSearchParams({
      q: searchTerm,
      _t: Date.now().toString(),
    });
    if (lng !== undefined) params.append('lng', String(lng));
    if (lat !== undefined) params.append('lat', String(lat));
    if (radius !== undefined) params.append('radius', String(radius));
    if (category && category !== '') params.append('category', category);
    const response = await apiClient.get(`/services/search/text?${params}`);
    return response.data;
  },

  // ==================== CRUD PRINCIPAL ====================

  create: async (data: CreateServiceData): Promise<Service> => {
    // Envoyer uniquement name, description, category, duration, images
    // location et slots sont optionnels → à renseigner plus tard
    const payload: Partial<CreateServiceData> = {
      name: data.name,
      description: data.description,
      category: data.category,
      duration: data.duration,
      images: data.images,
    };
    // Inclure la location seulement si elle est vraiment renseignée
    if (
      data.location &&
      data.location.address &&
      data.location.city &&
      data.location.governorate
    ) {
      payload.location = data.location;
    }
    const response = await apiClient.post('/services', payload);
    return response.data;
  },

  update: async (id: string, data: Partial<CreateServiceData>): Promise<Service> => {
    const response = await apiClient.put(`/services/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/services/${id}`);
  },

toggleActive: async (id: string): Promise<Service> => {
  // Utiliser la route admin si l'utilisateur est admin
  const user = getUser();
  const endpoint = user?.role === 'admin' 
    ? `/services/admin/${id}/toggle-active`
    : `/services/${id}/toggle-active`;
  
  const response = await apiClient.patch(endpoint);
  return response.data;
},

  // ==================== LOCALISATION ====================

  /**
   * Mettre à jour la localisation d'un service spécifique
   * PATCH /services/:id/location
   */
  updateLocation: async (
    id: string,
    data: UpsertLocationData,
  ): Promise<Service> => {
    const response = await apiClient.patch(`/services/${id}/location`, data);
    return response.data;
  },

  // Legacy — conservé pour compatibilité
  upsertLocation: async (
    data: UpsertLocationData,
  ): Promise<{ action: string; service: Service }> => {
    const response = await apiClient.put('/services/location/upsert', data);
    return response.data;
  },

  // ==================== DISPONIBILITÉS ====================

  /**
   * Mettre à jour les disponibilités d'un service
   * PATCH /services/:id/availability
   */
updateAvailability: async (
  id: string,
  data: {
    slots?: BackendServiceSlot[];  // ✅ Utiliser le type backend
    openingHours?: { [key: string]: { open: string; close: string } };
    duration?: number;
    cancellationPolicy?: { minHoursBefore: number; refundPercentage: number };
  },
): Promise<Service> => {
  const response = await apiClient.patch(`/services/${id}/availability`, data);
  return response.data;
},



  // lib/api/services/services.api.ts

// ==================== ADMIN (Bannissement uniquement) ====================

getAllAdmin: async (): Promise<Service[]> => {
  const response = await apiClient.get(`/services/admin/all?_t=${Date.now()}`);
  return response.data;
},

getPendingServices: async (): Promise<Service[]> => {
  const response = await apiClient.get(`/services/admin/pending?_t=${Date.now()}`);
  return response.data;
},

getPendingCount: async (): Promise<number> => {
  const response = await apiClient.get(`/services/admin/pending/count?_t=${Date.now()}`);
  return response.data.count;
},

getBannedServices: async (): Promise<Service[]> => {
  const response = await apiClient.get(`/services/admin/banned?_t=${Date.now()}`);
  return response.data;
},

approveService: async (serviceId: string): Promise<Service> => {
  const response = await apiClient.patch(`/services/admin/${serviceId}/approve`);
  return response.data;
},

rejectService: async (serviceId: string, reason: string): Promise<Service> => {
  const response = await apiClient.patch(`/services/admin/${serviceId}/reject`, { reason });
  return response.data;
},

// ✅ Nouvelles méthodes - Bannissement
banService: async (serviceId: string, reason: string): Promise<Service> => {
  const response = await apiClient.patch(`/services/admin/${serviceId}/ban`, { reason });
  return response.data;
},

unbanService: async (serviceId: string): Promise<Service> => {
  const response = await apiClient.patch(`/services/admin/${serviceId}/unban`);
  return response.data;
},
};
