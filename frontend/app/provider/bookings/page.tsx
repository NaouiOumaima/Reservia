'use client';

import { useCallback, useEffect, useState } from 'react';
import { Reservation, reservationsApi } from '@/lib/api/reservations';
import { servicesApi } from '@/lib/api/services';
import { Service } from '@/lib/api/services/types';
import { useSocket } from '@/hooks/useSocket';
import { RESERVATION_STATUS_LABELS, RESERVATION_STATUS_BADGES } from '@/lib/helpers/reservationStatus';
import { CalendarIcon, CheckCircleIcon, XCircleIcon, CheckIcon } from '@/components/ui/Icons';

type FilterType = 'all' | 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'expired';

export default function ProviderBookingsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>('all');
  const [serviceFilter, setServiceFilter] = useState<string>('all');
  const [actingId, setActingId] = useState<string | null>(null);
  const { socket } = useSocket();

  const fetchReservations = useCallback(async () => {
    try {
      const data = await reservationsApi.getProviderReservations();
      setReservations(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Erreur chargement réservations provider:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReservations();
    servicesApi.getByProvider().then(setServices).catch(console.error);
  }, [fetchReservations]);

  // Mise à jour temps réel sans rechargement de page : nouvelle réservation,
  // annulation auto par le sweep backend, etc.
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

  const filteredReservations = reservations.filter((res) => {
    if (filter !== 'all' && res.status !== filter) return false;
    if (serviceFilter !== 'all' && res.serviceId !== serviceFilter) return false;
    return true;
  });

  const runAction = async (id: string, action: 'confirm' | 'cancel' | 'complete') => {
    setActingId(id);
    try {
      const updated =
        action === 'confirm' ? await reservationsApi.confirm(id)
        : action === 'complete' ? await reservationsApi.complete(id)
        : await reservationsApi.cancel(id);
      setReservations((prev) => prev.map((r) => (r._id === id ? { ...r, ...updated } : r)));
    } catch (error) {
      console.error(`Erreur action ${action}:`, error);
    } finally {
      setActingId(null);
    }
  };

  const formatDate = (date: string | Date | undefined) => {
    if (!date) return 'Date non spécifiée';
    return new Date(date).toLocaleDateString('fr-FR');
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen py-8">
      <div className="container-app">
        <div className="mb-8">
          <h1 className="text-2xl font-bold gradient-text">Réservations reçues</h1>
          <p className="text-muted mt-1">Voir et gérer les demandes de vos clients</p>
        </div>

        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex flex-wrap gap-2">
            {(['all', 'pending', 'confirmed', 'completed', 'cancelled', 'expired'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`btn ${filter === f ? 'btn-primary' : 'btn-ghost'}`}
              >
                {f === 'all' ? 'Toutes' : RESERVATION_STATUS_LABELS[f]}
              </button>
            ))}
          </div>

          {services.length > 0 && (
            <select
              className="input"
              style={{ maxWidth: '16rem' }}
              value={serviceFilter}
              onChange={(e) => setServiceFilter(e.target.value)}
            >
              <option value="all">Tous les services</option>
              {services.map((s) => (
                <option key={s._id} value={s._id}>{s.name}</option>
              ))}
            </select>
          )}
        </div>

        <div className="space-y-4">
          {filteredReservations.length === 0 ? (
            <div className="card text-center py-12">
              <CalendarIcon className="w-16 h-16 text-muted mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Aucune réservation
              </h3>
              <p className="text-muted">
                {filter === 'all'
                  ? "Vous n'avez pas encore de réservations"
                  : `Aucune réservation ${RESERVATION_STATUS_LABELS[filter]?.toLowerCase() || filter}`}
              </p>
            </div>
          ) : (
            filteredReservations.map((res) => (
              <div key={res._id} className={`card ${actingId === res._id ? 'opacity-60 pointer-events-none' : ''}`}>
                <div className="flex flex-col md:flex-row md:items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className={`badge ${RESERVATION_STATUS_BADGES[res.status] || 'badge'}`}>
                        {RESERVATION_STATUS_LABELS[res.status] || res.status}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-foreground">
                      {res.serviceName}
                    </h3>
                    <p className="text-muted">Client: {res.customerInfo?.name}</p>
                    <p className="text-sm text-muted">
                      {res.customerInfo?.email} - {res.customerInfo?.phone}
                    </p>
                  </div>
                  <div className="mt-4 md:mt-0 md:ml-8 text-right">
                    <p className="font-medium text-foreground">
                      {formatDate(res.startTime)}
                    </p>
                    <p className="text-muted">
                      {res.startTime} - {res.endTime}
                    </p>
                  </div>
                </div>

                {(res.status === 'pending' || res.status === 'confirmed') && (
                  <div className="mt-4 flex flex-wrap gap-3 pt-4 border-t border-border">
                    {res.status === 'pending' && (
                      <>
                        <button
                          onClick={() => runAction(res._id, 'confirm')}
                          className="btn btn-primary"
                        >
                          <CheckCircleIcon className="w-4 h-4" /> Confirmer
                        </button>
                        <button
                          onClick={() => runAction(res._id, 'cancel')}
                          className="btn btn-ghost text-error border border-error hover:bg-error/10"
                        >
                          <XCircleIcon className="w-4 h-4" /> Refuser
                        </button>
                      </>
                    )}
                    {res.status === 'confirmed' && (
                      <>
                        <button
                          onClick={() => runAction(res._id, 'complete')}
                          className="btn btn-primary"
                        >
                          <CheckIcon className="w-4 h-4" /> Terminer
                        </button>
                        <button
                          onClick={() => runAction(res._id, 'cancel')}
                          className="btn btn-ghost text-error border border-error hover:bg-error/10"
                        >
                          <XCircleIcon className="w-4 h-4" /> Annuler
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
