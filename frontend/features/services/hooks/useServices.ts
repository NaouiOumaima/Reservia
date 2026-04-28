// features/services/hooks/useServices.ts
import { useState, useCallback } from 'react';
import { servicesApi } from '@/lib/api';
import { Service, SearchFilters } from '@/types';

export const useServices = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ✅ Ajoutez cette fonction 'search' qui est utilisée par la page
  const search = useCallback(async (query: string, filters?: SearchFilters) => {
    setLoading(true);
    setError(null);
    try {
      let results: Service[] = [];
      
      // Si on a une localisation, on utilise getNearby
      if (filters?.location?.lat && filters?.location?.lng) {
        results = await servicesApi.getNearby(
          filters.location.lng,
          filters.location.lat,
          filters.location.radius
        );
      } else {
        // Sinon recherche normale
        results = await servicesApi.getAll(filters);
      }
      
      setServices(results);
      return results;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la recherche');
      console.error(err);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchServices = useCallback(async (filters?: SearchFilters) => {
    setLoading(true);
    setError(null);
    try {
      const data = await servicesApi.getAll(filters);
      setServices(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchNearby = useCallback(async (lng: number, lat: number, radius?: number) => {
    setLoading(true);
    setError(null);
    try {
      const data = await servicesApi.getNearby(lng, lat, radius);
      setServices(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const getService = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const service = await servicesApi.getById(id);
      return service;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement');
      console.error(err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const createService = useCallback(async (data: any) => {
    setLoading(true);
    setError(null);
    try {
      const newService = await servicesApi.create(data);
      setServices(prev => [...prev, newService]);
      return newService;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la création');
      console.error(err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateService = useCallback(async (id: string, data: any) => {
    setLoading(true);
    setError(null);
    try {
      const updated = await servicesApi.update(id, data);
      setServices(prev => prev.map(s => s._id === id ? updated : s));
      return updated;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la mise à jour');
      console.error(err);
      return null;
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
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la suppression');
      console.error(err);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const toggleActive = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const updated = await servicesApi.toggleActive(id);
      setServices(prev => prev.map(s => s._id === id ? updated : s));
      return updated;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du changement de statut');
      console.error(err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    services,
    loading,
    error,
    search,           // ✅ Ajoutez cette ligne
    fetchServices,
    fetchNearby,
    getService,
    createService,
    updateService,
    deleteService,
    toggleActive,
  };
};