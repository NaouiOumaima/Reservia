// features/services/hooks/useServices.ts

import { useState, useCallback } from 'react';
import { servicesApi, searchApi } from '@/lib/api/client';
import { Service, SearchFilters } from '@/types';

export const useServices = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [total, setTotal] = useState(0);

  const getAll = useCallback(async (query?: any) => {
    setLoading(true);
    setError(null);
    try {
      const response = await servicesApi.getAll(query);
      const data = response.data;
      setServices(data.data || data);
      setTotal(data.total || data.length || 0);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors du chargement des services');
    } finally {
      setLoading(false);
    }
  }, []);

  const getById = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await servicesApi.getById(id);
      return response.data;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors du chargement du service');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getNearby = useCallback(async (lng: number, lat: number, distance?: number) => {
    setLoading(true);
    setError(null);
    try {
      const response = await servicesApi.getNearby(lng, lat, distance);
      setServices(response.data);
      setTotal(response.data.length);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors du chargement des services à proximité');
    } finally {
      setLoading(false);
    }
  }, []);

  const search = useCallback(async (query: string, filters?: SearchFilters) => {
    setLoading(true);
    setError(null);
    try {
      const response = await searchApi.search(query, filters);
      setServices(response.data);
      setTotal(response.data.length);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la recherche');
    } finally {
      setLoading(false);
    }
  }, []);

  return { 
    services, 
    loading, 
    error, 
    total,
    getAll, 
    getById,
    getNearby, 
    search 
  };
};