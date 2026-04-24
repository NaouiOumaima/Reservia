// features/client/hooks/useClientReservations.ts

import { useState, useEffect, useCallback } from 'react';
import { reservationsApi } from '@/lib/api/client';
import { Reservation } from '@/types';

interface UseClientReservationsReturn {
  reservations: Reservation[];
  loading: boolean;
  error: string | null;
  fetchReservations: (filter?: 'all' | 'upcoming' | 'past') => Promise<void>;
  cancelReservation: (id: string, reason?: string) => Promise<void>;
}

export function useClientReservations(): UseClientReservationsReturn {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReservations = useCallback(async (filter: 'all' | 'upcoming' | 'past' = 'all') => {
    setLoading(true);
    setError(null);
    try {
      const response = await reservationsApi.getMy();
      let data = response.data || response;
      
      // Apply filter
      const now = new Date();
      if (filter === 'upcoming') {
        data = data.filter((r: Reservation) => new Date(r.date!) > now && r.status !== 'cancelled');
      } else if (filter === 'past') {
        data = data.filter((r: Reservation) => new Date(r.date!) <= now || r.status === 'cancelled');
      }
      
      setReservations(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors du chargement des réservations');
    } finally {
      setLoading(false);
    }
  }, []);

  const cancelReservation = useCallback(async (id: string, reason?: string) => {
    setLoading(true);
    setError(null);
    try {
      await reservationsApi.cancel(id, { reason });
      setReservations(prev => prev.filter(r => r._id !== id));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de l\'annulation');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReservations();
  }, [fetchReservations]);

  return { reservations, loading, error, fetchReservations, cancelReservation };
}