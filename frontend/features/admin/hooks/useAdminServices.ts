// features/admin/hooks/useAdminServices.ts

import { useState, useEffect, useCallback } from 'react';
import { servicesApi } from '@/lib/api/client';
import { Service } from '@/types';

interface UseAdminServicesReturn {
  pendingServices: Service[];
  loading: boolean;
  error: string | null;
  fetchPendingServices: () => Promise<void>;
  approveService: (serviceId: string) => Promise<void>;
  rejectService: (serviceId: string, reason: string) => Promise<void>;
  pendingCount: number;
}

export function useAdminServices(): UseAdminServicesReturn {
  const [pendingServices, setPendingServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingCount, setPendingCount] = useState(0);

  const fetchPendingServices = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await servicesApi.getPending();
      setPendingServices(response.data || response);
      
      const countResponse = await servicesApi.getPendingCount();
      setPendingCount(countResponse.data?.count || 0);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors du chargement des services');
    } finally {
      setLoading(false);
    }
  }, []);

  const approveService = useCallback(async (serviceId: string) => {
    setLoading(true);
    setError(null);
    try {
      await servicesApi.approveService(serviceId);
      setPendingServices(prev => prev.filter(s => s._id !== serviceId));
      setPendingCount(prev => prev - 1);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la validation');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const rejectService = useCallback(async (serviceId: string, reason: string) => {
    setLoading(true);
    setError(null);
    try {
      await servicesApi.rejectService(serviceId, reason);
      setPendingServices(prev => prev.filter(s => s._id !== serviceId));
      setPendingCount(prev => prev - 1);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors du rejet');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPendingServices();
  }, [fetchPendingServices]);

  return { pendingServices, loading, error, fetchPendingServices, approveService, rejectService, pendingCount };
}