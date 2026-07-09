// features/provider/hooks/useProviderServices.ts

import { useState, useEffect, useCallback } from 'react';
import { servicesApi } from '@/lib/api';
import { CreateServiceData, Service } from '@/lib/api/services/types';

interface UseProviderServicesReturn {
  services: Service[];
  loading: boolean;
  error: string | null;
  fetchServices: () => Promise<void>;
  createService: (data: CreateServiceData) => Promise<Service>;
  updateService: (id: string, data: Partial<Service>) => Promise<void>;
  deleteService: (id: string) => Promise<void>;
  toggleServiceActive: (id: string) => Promise<void>;
}

export function useProviderServices(): UseProviderServicesReturn {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchServices = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const services = await servicesApi.getByProvider();
      setServices(services);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors du chargement des services');
    } finally {
      setLoading(false);
    }
  }, []);

  const createService = useCallback(async (data: CreateServiceData): Promise<Service> => {
    setLoading(true);
    setError(null);
    try {
      const newService = await servicesApi.create(data);
      setServices(prev => [newService, ...prev]);
      return newService;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la création du service');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateService = useCallback(async (id: string, data: Partial<Service>) => {
    setLoading(true);
    setError(null);
    try {
      const updatedService = await servicesApi.update(id, data);
      setServices(prev => prev.map(s => s._id === id ? updatedService : s));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la mise à jour du service');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteService = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      await servicesApi.delete(id);
      setServices(prev => prev.filter(s => s._id !== id));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la suppression du service');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const toggleServiceActive = useCallback(async (id: string) => {
    try {
      const updatedService = await servicesApi.toggleActive(id);
      setServices(prev => prev.map(s => s._id === id ? updatedService : s));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors du changement de statut');
      throw err;
    }
  }, []);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  return { services, loading, error, fetchServices, createService, updateService, deleteService, toggleServiceActive };
}