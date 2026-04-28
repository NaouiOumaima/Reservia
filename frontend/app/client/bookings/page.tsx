'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Reservation, reservationsApi } from '@/lib/api/reservations';
import { CalendarIcon, StarIcon } from '@/components/ui/Icons';

export default function ClientBookingsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past'>('all');

  useEffect(() => {
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
    fetchReservations();
  }, []);

  const cancelReservation = async (id: string) => {
    if (confirm('Annuler cette réservation ?')) {
      await reservationsApi.cancel(id);
      setReservations(reservations.map(r => r._id === id ? { ...r, status: 'cancelled' } : r));
    }
  };

  const formatDate = (date: string | Date | undefined) => {
    if (!date) return 'Date non spécifiée';
    return new Date(date).toLocaleDateString('fr-FR');
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
            {filteredReservations.map(res => (
              <div key={res._id} className="card">
                <div className="flex flex-col md:flex-row justify-between">
                  <div>
                    <span className={`badge ${getStatusBadge(res.status)}`}>{getStatusLabel(res.status)}</span>
                    <h3 className="text-lg font-semibold mt-2">{res.serviceName}</h3>
                    <p className="text-muted">{res.providerName}</p>
                  </div>
                  <div className="mt-4 md:mt-0 text-right">
                    <p className="font-medium">{formatDate(res.date)}</p>
                    <p className="text-muted">{res.startTime} - {res.endTime}</p>
                    <p className="text-primary font-bold mt-1">{res.price} DT</p>
                  </div>
                </div>
                <div className="mt-4 flex gap-4 pt-4 border-t">
                  <Link href={`/service/${res.serviceId}`} className="text-primary">Voir le service</Link>
                  {res.status === 'confirmed' && (
                    <button onClick={() => cancelReservation(res._id)} className="text-error">Annuler</button>
                  )}
                 {res.status === 'completed' && (
  <Link href={`/service/${res.serviceId}/review`} className="text-primary flex items-center gap-1">
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