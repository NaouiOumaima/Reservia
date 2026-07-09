'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Reservation, reservationsApi } from '@/lib/api/reservations';
import { useSocket } from '@/hooks/useSocket';
import { RESERVATION_STATUS_LABELS, RESERVATION_STATUS_BADGES } from '@/lib/helpers/reservationStatus';
import { CalendarIcon, StarIcon, MapPinIcon } from '@/components/ui/Icons';

type TabType = 'upcoming' | 'past' | 'cancelled';

const UPCOMING_STATUSES = ['pending', 'confirmed'];
const CANCELLED_STATUSES = ['cancelled', 'expired'];

export default function ClientBookingsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<TabType>('upcoming');
  const { socket } = useSocket();

  const fetchReservations = useCallback(async () => {
    try {
      const data = await reservationsApi.getMyReservations();
      setReservations(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReservations();
  }, [fetchReservations]);

  // Statut mis à jour en temps réel sans rechargement de page
  useEffect(() => {
    if (!socket) return;

    const handleUpdate = (updated: Reservation) => {
      setReservations((prev) => {
        const exists = prev.some((r) => r._id === updated._id);
        if (exists) {
          return prev.map((r) => (r._id === updated._id ? { ...r, ...updated } : r));
        }
        return [updated, ...prev];
      });
    };

    socket.on('reservation_updated', handleUpdate);
    return () => {
      socket.off('reservation_updated', handleUpdate);
    };
  }, [socket]);

  const cancelReservation = async (id: string) => {
    if (!confirm('Annuler cette réservation ?')) return;
    try {
      await reservationsApi.cancel(id);
      setReservations((prev) =>
        prev.map((r) => (r._id === id ? { ...r, status: 'cancelled' } : r)),
      );
    } catch (error) {
      console.error(error);
    }
  };

  const formatDate = (date: string | Date | undefined) => {
    if (!date) return 'Date non spécifiée';
    return new Date(date).toLocaleDateString('fr-FR');
  };

  const filteredReservations = reservations.filter((res) => {
    if (tab === 'upcoming') return UPCOMING_STATUSES.includes(res.status);
    if (tab === 'past') return res.status === 'completed';
    return CANCELLED_STATUSES.includes(res.status);
  });

  if (loading) return <div className="flex justify-center py-12"><div className="spinner" /></div>;

  return (
    <div className="bg-background min-h-screen py-8">
      <div className="container-app">
        <h1 className="text-2xl font-bold gradient-text">Mes Réservations</h1>
        <p className="text-muted mb-6">Gérez vos réservations passées et à venir</p>

        <div className="flex gap-2 mb-6">
          {([
            ['upcoming', 'À venir'],
            ['past', 'Passées'],
            ['cancelled', 'Annulées'],
          ] as [TabType, string][]).map(([value, label]) => (
            <button
              key={value}
              onClick={() => setTab(value)}
              className={`btn ${tab === value ? 'btn-primary' : 'btn-ghost'}`}
            >
              {label}
            </button>
          ))}
        </div>

        {filteredReservations.length === 0 ? (
          <div className="card text-center py-12">
            <CalendarIcon className="w-16 h-16 text-muted mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">Aucune réservation</h3>
            <Link href="/search" className="btn btn-primary">Découvrir des services</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredReservations.map(res => (
              <div key={res._id} className="card">
                <div className="flex flex-col md:flex-row justify-between">
                  <div>
                    <span className={`badge ${RESERVATION_STATUS_BADGES[res.status] || 'badge'}`}>{RESERVATION_STATUS_LABELS[res.status] || res.status}</span>
                    <h3 className="text-lg font-semibold text-foreground mt-2">{res.serviceName}</h3>
                    <p className="text-muted">{res.providerName}</p>
                  </div>
                  <div className="mt-4 md:mt-0 text-right">
                    <p className="font-medium text-foreground">{formatDate(res.startTime)}</p>
                    <p className="text-muted">{res.startTime} - {res.endTime}</p>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-4 pt-4 border-t border-border">
                  <Link href={`/service/${res.serviceId}`} className="text-primary hover:opacity-70">
                    Voir le service
                  </Link>
                  {res.serviceLocation?.coordinates && (
                    <Link
                      href={`/client/carte?serviceId=${res.serviceId}`}
                      className="text-primary flex items-center gap-1 hover:opacity-70"
                    >
                      <MapPinIcon className="w-4 h-4" /> Itinéraire
                    </Link>
                  )}
                  {(res.status === 'pending' || res.status === 'confirmed') && (
                    <button
                      onClick={() => cancelReservation(res._id)}
                      className="text-error hover:opacity-70"
                    >
                      Annuler
                    </button>
                  )}
                  {res.status === 'completed' && (
                    <Link
                      href={`/service/${res.serviceId}/review`}
                      className="text-primary flex items-center gap-1 hover:opacity-70"
                    >
                      <StarIcon className="w-4 h-4" /> Donner un avis
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
