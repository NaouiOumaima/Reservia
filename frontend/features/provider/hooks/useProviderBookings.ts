// features/provider/hooks/useProviderBookings.ts

import { useState, useEffect, useCallback } from 'react';
import { reservationsApi } from '@/lib/api/client';
import { Reservation } from '@/types';

interface UseProviderBookingsReturn {
  reservations: Reservation[];
  loading: boolean;
  error: string | null;
  fetchReservations: (filter?: 'all' | 'pending' | 'confirmed' | 'completed' | 'cancelled') => Promise<void>;
  confirmReservation: (id: string) => Promise<void>;
  cancelReservation: (id: string, reason?: string) => Promise<void>;
  completeReservation: (id: string) => Promise<void>;
}

export function useProviderBookings(): UseProviderBookingsReturn {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReservations = useCallback(async (filter: 'all' | 'pending' | 'confirmed' | 'completed' | 'cancelled' = 'all') => {
    setLoading(true);
    setError(null);
    try {
      const response = await reservationsApi.getProvider();
      let data = response.data || response;
      
      if (filter !== 'all') {
        data = data.filter((r: Reservation) => r.status === filter);
      }
      
      setReservations(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors du chargement des réservations');
    } finally {
      setLoading(false);
    }
  }, []);

  const confirmReservation = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      await reservationsApi.confirm(id);
      setReservations(prev => prev.map(r => 
        r._id === id ? { ...r, status: 'confirmed' as const } : r
      ));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la confirmation');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const cancelReservation = useCallback(async (id: string, reason?: string) => {
    setLoading(true);
    setError(null);
    try {
      await reservationsApi.cancel(id, { reason });
      setReservations(prev => prev.map(r => 
        r._id === id ? { ...r, status: 'cancelled' as const } : r
      ));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de l\'annulation');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const completeReservation = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      await reservationsApi.complete(id);
      setReservations(prev => prev.map(r => 
        r._id === id ? { ...r, status: 'completed' as const } : r
      ));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la complétion');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReservations();
  }, [fetchReservations]);

  return { 
    reservations, 
    loading, 
    error, 
    fetchReservations, 
    confirmReservation, 
    cancelReservation, 
    completeReservation 
  };
}