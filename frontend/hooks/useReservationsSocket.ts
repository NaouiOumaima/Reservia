// frontend/hooks/useReservationsSocket.ts
import { useEffect, useState } from 'react';
import { useSocket } from './useSocket';
import { reservationsApi } from '@/lib/api/reservations';
import { Reservation } from '@/lib/api/reservations';

export function useReservationsSocket() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const { socket, isConnected } = useSocket();

  const fetchReservations = async () => {
    try {
      const data = await reservationsApi.getProviderReservations();
      setReservations(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  useEffect(() => {
    if (!socket) return;

    const handleReservationsUpdated = (data: any) => {
      console.log('🔄 Mise à jour des réservations via WebSocket:', data);
      fetchReservations();
    };

    socket.on('reservations_updated', handleReservationsUpdated);

    return () => {
      socket.off('reservations_updated', handleReservationsUpdated);
    };
  }, [socket]);

  return { reservations, loading, fetchReservations, isConnected };
}