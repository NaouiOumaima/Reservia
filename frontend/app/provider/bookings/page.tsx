'use client';

import { useEffect, useState } from 'react';
import { Reservation } from '@/types';
import { CalendarIcon } from '@/components/ui/Icons';

type FilterType = 'all' | 'pending' | 'confirmed' | 'completed' | 'cancelled';

export default function ProviderBookingsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>('all');

  useEffect(() => {
    // Simuler le chargement – remplacer par appel API réel
    setLoading(false);
  }, []);

  const filteredReservations = reservations.filter((res) =>
    filter === 'all' ? true : res.status === filter
  );

  const updateStatus = (id: string, status: Reservation['status']) => {
    setReservations(reservations.map((r) => (r._id === id ? { ...r, status } : r)));
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

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'confirmed': return 'badge-success';
      case 'pending': return 'badge-warning';
      case 'completed': return 'badge-primary';
      case 'cancelled': return 'badge-error';
      default: return 'badge';
    }
  };

  const formatDate = (date: string | Date | undefined) => {
    if (!date) return 'Date non spécifiée';
    return new Date(date).toLocaleDateString('fr-FR');
  };

  return (
    <div className="min-h-screen bg-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground">Réservations reçues</h1>
          <p className="text-muted mt-1">Voir et gérer les commandes</p>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {(['all', 'pending', 'confirmed', 'completed', 'cancelled'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === f ? 'btn btn-primary' : 'btn btn-ghost'
              }`}
            >
              {f === 'all' ? 'Toutes' : getStatusLabel(f)}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
            </div>
          ) : filteredReservations.length === 0 ? (
            <div className="card p-12 text-center">
              <CalendarIcon className="w-16 h-16 text-muted mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Aucune réservation
              </h3>
              <p className="text-muted">
                {filter === 'all'
                  ? "Vous n'avez pas encore de réservations"
                  : `Aucune réservation ${filter === 'pending' ? 'en attente' : filter}`}
              </p>
            </div>
          ) : (
            filteredReservations.map((res) => (
              <div key={res._id} className="card p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className={`badge ${getStatusBadgeClass(res.status)}`}>
                        {getStatusLabel(res.status)}
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
                      {formatDate(res.date)}
                    </p>
                    <p className="text-muted">
                      {res.startTime} - {res.endTime}
                    </p>
                    <p className="text-primary font-bold mt-1">{res.price} DT</p>
                  </div>
                </div>

                {res.status === 'pending' && (
                  <div className="mt-4 flex space-x-4 pt-4 border-t border-border">
                    <button
                      onClick={() => updateStatus(res._id, 'confirmed')}
                      className="btn btn-primary"
                    >
                      Confirmer
                    </button>
                    <button
                      onClick={() => updateStatus(res._id, 'cancelled')}
                      className="btn btn-error"
                    >
                      Refuser
                    </button>
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