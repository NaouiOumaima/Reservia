'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { reservationsApi } from '@/lib/api/reservations';
import { CalendarIcon, StarIcon } from '@/components/ui/Icons';
import { useSocket } from '@/hooks/useSocket';
import { Reservation } from '@/lib/api/reservations';

export default function ClientBookingsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past'>('all');
  const { socket, isConnected } = useSocket();

  const fetchReservations = async () => {
    try {
      const data = await reservationsApi.getMyReservations();
      setReservations(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  // Écouter les mises à jour WebSocket
  useEffect(() => {
    if (!socket) return;

    const handleReservationsUpdated = () => {
      console.log('🔄 Rafraîchissement des réservations client via WebSocket');
      fetchReservations();
    };

    socket.on('reservations_updated', handleReservationsUpdated);

    return () => {
      socket.off('reservations_updated', handleReservationsUpdated);
    };
  }, [socket]);

  const cancelReservation = async (id: string) => {
    if (confirm('Annuler cette réservation ?')) {
      try {
        await reservationsApi.cancel(id);
        fetchReservations(); // Rafraîchir après annulation
      } catch (error) {
        console.error('Erreur annulation:', error);
      }
    }
  };

  const formatDate = (date: string | Date | undefined) => {
    if (!date) return 'Date non spécifiée';
    return new Date(date).toLocaleDateString('fr-FR');
  };

  const getServiceId = (res: Reservation): string => {
    if (!res.serviceId) return '';
    if (typeof res.serviceId === 'string') {
      return res.serviceId;
    }
    return (res.serviceId as any)._id || '';
  };

  const getServiceName = (res: Reservation): string => {
    if (res.serviceName) return res.serviceName;
    if (res.serviceId && typeof res.serviceId === 'object' && (res.serviceId as any).name) {
      return (res.serviceId as any).name;
    }
    return 'Service';
  };

  const filteredReservations = reservations.filter(res => {
    if (filter === 'upcoming') return res.status === 'confirmed' && new Date(res.date!) > new Date();
    if (filter === 'past') return res.status === 'completed' || (res.status === 'cancelled');
    return true;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed': return 'badge-success';
      case 'pending': return 'badge-warning';
      case 'completed': return 'badge-primary';
      case 'cancelled': return 'badge-error';
      default: return 'badge';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'confirmed': return 'Confirmée';
      case 'pending': return 'En attente';
      case 'completed': return 'Terminée';
      case 'cancelled': return 'Annulée';
      default: return status;
    }
  };

  if (loading) return <div className="flex justify-center py-12"><div className="spinner" /></div>;

  return (
    <div className="min-h-screen bg-surface">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Indicateur de connexion WebSocket */}
        <div className="mb-4 text-right">
          <span className={`text-xs px-2 py-1 rounded-full ${isConnected ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {isConnected ? '🟢 Live' : '🔴 Connexion...'}
          </span>
        </div>

        <h1 className="text-2xl font-bold mb-2">Mes Réservations</h1>
        <p className="text-muted mb-6">Gérez vos réservations passées et à venir</p>

        <div className="flex gap-2 mb-6">
          {(['all', 'upcoming', 'past'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)} className={`btn ${filter === f ? 'btn-primary' : 'btn-ghost'}`}>
              {f === 'all' ? 'Toutes' : f === 'upcoming' ? 'À venir' : 'Passées'}
            </button>
          ))}
        </div>

        {filteredReservations.length === 0 ? (
          <div className="card text-center py-12">
            <CalendarIcon className="w-16 h-16 text-muted mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Aucune réservation</h3>
            <Link href="/search" className="btn btn-primary">Découvrir des services</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredReservations.map(res => {
              const serviceId = getServiceId(res);
              const serviceName = getServiceName(res);
              
              return (
                <div key={res._id} className="card">
                  <div className="flex flex-col md:flex-row justify-between">
                    <div>
                      <span className={`badge ${getStatusBadge(res.status)}`}>{getStatusLabel(res.status)}</span>
                      <h3 className="text-lg font-semibold mt-2">{serviceName}</h3>
                      <p className="text-muted">{res.providerName || 'Prestataire'}</p>
                    </div>
                    <div className="mt-4 md:mt-0 text-right">
                      <p className="font-medium">{formatDate(res.date)}</p>
                      <p className="text-muted">{res.startTime} - {res.endTime}</p>
                      <p className="text-primary font-bold mt-1">{res.price} DT</p>
                    </div>
                  </div>
                  <div className="mt-4 flex gap-4 pt-4 border-t">
                    {serviceId && (
                      <Link href={`/service/${serviceId}`} className="text-primary">
                        Voir le service
                      </Link>
                    )}
                    {res.status === 'confirmed' && (
                      <button onClick={() => cancelReservation(res._id)} className="text-error">
                        Annuler
                      </button>
                    )}
                    {res.status === 'completed' && serviceId && (
                      <Link href={`/service/${serviceId}/review`} className="text-primary flex items-center gap-1">
                        <StarIcon className="w-4 h-4" /> Donner un avis
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}