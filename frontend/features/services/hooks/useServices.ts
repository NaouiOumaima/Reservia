// features/services/hooks/useServices.ts

import { useState, useCallback } from 'react';
import { servicesApi } from '@/lib/api';
import type { Service, CreateServiceData, ServiceFilters } from '@/lib/api/services/types';

// Type étendu pour la recherche avec localisation + note min
interface SearchFiltersExtended extends ServiceFilters {
  location?: { lat: number; lng: number; radius?: number };
  minRating?: number;
}

export const useServices = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ─── search ───────────────────────────────────────────────────────────────
  const search = useCallback(async (_query: string, filters?: SearchFiltersExtended) => {
    setLoading(true);
    setError(null);
    try {
      let results: Service[] = [];

      if (filters?.location?.lat && filters?.location?.lng) {
        // 1. Récupère les services proches
        results = await servicesApi.getNearby(
          filters.location.lng,
          filters.location.lat,
          filters.location.radius,
          filters.category
        );

        // 2. Filtrage côté client pour la note minimale
        if (filters.minRating !== undefined && filters.minRating > 0) {
          results = results.filter((s) => (s.avgRating ?? 0) >= filters.minRating!);
        }
      } else {
        // Pas de localisation → recherche classique
        const response = await servicesApi.getAll(filters);
        // ✅ Correction: extraire le tableau services de la réponse
        results = Array.isArray(response) ? response : response.services || [];
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

  // ─── fetchServices ────────────────────────────────────────────────────────
  const fetchServices = useCallback(async (filters?: ServiceFilters) => {
    setLoading(true);
    setError(null);
    try {
      const response = await servicesApi.getAll(filters);
      // ✅ Correction: extraire le tableau services de la réponse
      const servicesArray = Array.isArray(response) ? response : response.services || [];
      setServices(servicesArray);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  // ─── fetchNearby ──────────────────────────────────────────────────────────
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

  // ─── getService ───────────────────────────────────────────────────────────
  const getService = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      return await servicesApi.getById(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement');
      console.error(err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // ─── createService ────────────────────────────────────────────────────────
  const createService = useCallback(async (data: CreateServiceData) => {
    setLoading(true);
    setError(null);
    try {
      const newService = await servicesApi.create(data);
      setServices((prev) => [...prev, newService]);
      return newService;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la création');
      console.error(err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // ─── updateService ────────────────────────────────────────────────────────
  const updateService = useCallback(async (id: string, data: Partial<CreateServiceData>) => {
    setLoading(true);
    setError(null);
    try {
      const updated = await servicesApi.update(id, data);
      setServices((prev) => prev.map((s) => (s._id === id ? updated : s)));
      return updated;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la mise à jour');
      console.error(err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // ─── deleteService ────────────────────────────────────────────────────────
  const deleteService = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      await servicesApi.delete(id);
      setServices((prev) => prev.filter((s) => s._id !== id));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la suppression');
      console.error(err);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // ─── toggleActive ─────────────────────────────────────────────────────────
  const toggleActive = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const updated = await servicesApi.toggleActive(id);
      setServices((prev) => prev.map((s) => (s._id === id ? updated : s)));
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
    search,
    fetchServices,
    fetchNearby,
    getService,
    createService,
    updateService,
    deleteService,
    toggleActive,
  };
};