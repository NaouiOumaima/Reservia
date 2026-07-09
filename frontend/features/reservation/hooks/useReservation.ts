// features/reservation/hooks/useReservation.ts

import { useState, useCallback } from 'react';
import { CreateReservationData, Reservation, reservationsApi } from '@/lib/api/reservations';

interface UseReservationReturn {
  loading: boolean;
  error: string | null;
  createReservation: (data: CreateReservationData) => Promise<Reservation | null>;
  getMyReservations: () => Promise<Reservation[]>;
  getProviderReservations: () => Promise<Reservation[]>;
  confirmReservation: (id: string) => Promise<void>;
  cancelReservation: (id: string, reason?: string) => Promise<void>;
}

export const useReservation = (): UseReservationReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createReservation = useCallback(async (data: CreateReservationData) => {
    setLoading(true);
    setError(null);
    try {
      return await reservationsApi.create(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la création de la réservation');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const getMyReservations = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      return await reservationsApi.getMyReservations();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors du chargement des réservations');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const getProviderReservations = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      return await reservationsApi.getProviderReservations();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors du chargement des réservations');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const confirmReservation = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      await reservationsApi.confirm(id);
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
      await reservationsApi.cancel(id, reason);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de l\'annulation');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    createReservation,
    getMyReservations,
    getProviderReservations,
    confirmReservation,
    cancelReservation,
  };
};