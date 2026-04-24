// features/provider/hooks/useProviderLocation.ts

import { useState, useCallback } from 'react';
import { servicesApi } from '@/lib/api/client';
import { Location } from '@/types';

interface UseProviderLocationReturn {
  location: Location | null;
  loading: boolean;
  error: string | null;
  updateLocation: (location: Partial<Location>) => Promise<void>;
  fetchLocation: () => Promise<void>;
}

export function useProviderLocation(): UseProviderLocationReturn {
  const [location, setLocation] = useState<Location | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLocation = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Get provider's location from their first service
      const response = await servicesApi.getByProvider('');
      const services = response.data || response;
      if (services.length > 0) {
        setLocation(services[0].location);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors du chargement de la localisation');
    } finally {
      setLoading(false);
    }
  }, []);

  const updateLocation = useCallback(async (data: Partial<Location>) => {
    setLoading(true);
    setError(null);
    try {
      // Update location for all provider services
      const response = await servicesApi.getByProvider('');
      const services = response.data || response;
      
      for (const service of services) {
        await servicesApi.update(service._id, { location: { ...service.location, ...data } });
      }
      
      setLocation(prev => prev ? { ...prev, ...data } : data as Location);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la mise à jour de la localisation');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { location, loading, error, updateLocation, fetchLocation };
}