'use client';

import { useEffect, useState } from 'react';
import { reservationsApi } from '@/lib/api/reservations';
import { Reservation } from '@/lib/api/reservations/types';
import { CalendarIcon } from '@/components/ui/Icons';

type FilterType = 'all' | 'pending' | 'confirmed' | 'completed' | 'cancelled';

type ProviderReservation = Reservation & {
  clientId?: {
    _id?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
  };
  serviceId?: {
    _id?: string;
    name?: string;
    duration?: number;
    images?: string[];
    location?: string;
  };
  providerId?: {
    _id?: string;
    firstName?: string;
    lastName?: string;
  };
  notes?: string;
  numberOfPersons?: number;
  reservationDateTime?: string;  // ✅ Utiliser reservationDateTime
};

export default function ProviderBookingsPage() {
  const [reservations, setReservations] = useState<ProviderReservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>('all');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadReservations = async () => {
      try {
        const data = await reservationsApi.getProviderReservations();
        setReservations(data);
      } catch (err: any) {
        console.error('Erreur chargement réservations', err);
        setError(err?.response?.data?.message || 'Impossible de charger les réservations');
      } finally {
        setLoading(false);
      }
    };

    loadReservations();
  }, []);

  const updateReservation = (id: string, updated: ProviderReservation) => {
    setReservations((prev) => prev.map((reservation) => (
      reservation._id === id ? { ...reservation, ...updated } : reservation
    )));
  };

  const handleAccept = async (id: string) => {
    try {
      const updatedReservation = await reservationsApi.accept(id);
      updateReservation(id, updatedReservation as ProviderReservation);
    } catch (err: any) {
      console.error('Erreur lors de l’acceptation', err);
      setError(err?.response?.data?.message || 'Impossible d’accepter la réservation');
    }
  };

  const handleReject = async (id: string) => {
    try {
      const updatedReservation = await reservationsApi.reject(id);
      updateReservation(id, updatedReservation as ProviderReservation);
    } catch (err: any) {
      console.error('Erreur lors du refus', err);
      setError(err?.response?.data?.message || 'Impossible de refuser la réservation');
    }
  };

  const filteredReservations = reservations.filter((res) =>
    filter === 'all' ? true : res.status === filter
  );

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'confirmed': return 'Confirmée';
      case 'pending': return 'En attente';
      case 'completed': return 'Terminée';
      case 'cancelled': return 'Annulée';
      case 'expired': return 'Expirée';
      default: return status;
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'confirmed': return 'badge-success';
      case 'pending': return 'badge-warning';
      case 'completed': return 'badge-primary';
      case 'cancelled': return 'badge-error';
      case 'expired': return 'badge-error';
      default: return 'badge';
    }
  };

  // ✅ Formatage de la date et heure complète
  const formatDateTime = (dateTime: string | Date | undefined) => {
    if (!dateTime) return 'Date non spécifiée';
    const date = new Date(dateTime);
    return date.toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getServiceName = (res: ProviderReservation) => {
    if (!res.serviceId) return 'Service non précisé';
    if (typeof res.serviceId === 'string') return res.serviceId;
    return (res.serviceId as { name?: string }).name || 'Service sans nom';
  };

  const getClientName = (res: ProviderReservation) => {
    if (!res.clientId) return 'Client non précisé';
    if (typeof res.clientId === 'string') return res.clientId;
    const client = res.clientId as { firstName?: string; lastName?: string };
    if (client.firstName && client.lastName) {
      return `${client.firstName} ${client.lastName}`;
    }
    return client.firstName || client.lastName || 'Client';
  };

  const getClientContact = (res: ProviderReservation) => {
    if (!res.clientId || typeof res.clientId === 'string') return null;
    const client = res.clientId as { email?: string; phone?: string };
    return { email: client.email, phone: client.phone };
  };

  const getReservationDateTime = (res: ProviderReservation) => {
    return formatDateTime(res.reservationDateTime);
  };

  const getReservationQuantity = (res: ProviderReservation) => {
    if (res.numberOfPersons == null) return '-';
    return String(res.numberOfPersons);
  };

  const getReservationNote = (res: ProviderReservation) => {
    return res.notes || '-';
  };

  // ✅ Calculer si la réservation peut encore être confirmée (non expirée)
  const isReservationExpired = (res: ProviderReservation) => {
    return new Date(res.expiresAt) < new Date();
  };

  return (
    <div className="min-h-screen bg-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground">Réservations reçues</h1>
          <p className="text-muted mt-1">Voir et gérer les commandes</p>
          {error && (
            <p className="text-error mt-3">{error}</p>
          )}
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
                <div className="flex flex-col md:flex-row md:items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2 flex-wrap gap-2">
                      <span className={`badge ${getStatusBadgeClass(res.status)}`}>
                        {getStatusLabel(res.status)}
                      </span>
                      {res.status === 'pending' && isReservationExpired(res) && (
                        <span className="badge badge-error">Expirée</span>
                      )}
                    </div>
                    
                    {/* ✅ Informations du service */}
                    <h3 className="text-lg font-semibold text-foreground">
                      {getServiceName(res)}
                    </h3>
                    
                    {/* ✅ Informations du client */}
                    <div className="mt-3 p-3 bg-surface-muted rounded-lg">
                      <p className="text-sm font-medium text-foreground">Client : {getClientName(res)}</p>
                      {(() => {
                        const contact = getClientContact(res);
                        return contact && (
                          <div className="mt-1 text-sm text-muted">
                            {contact.email && <p>Email : {contact.email}</p>}
                            {contact.phone && <p>Tél : {contact.phone}</p>}
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                  
                  <div className="mt-4 md:mt-0 md:ml-8">
                    <div className="space-y-1">
                      <p className="font-medium text-foreground">
                        📅 {getReservationDateTime(res)}
                      </p>
                      <p className="text-muted">
                        👥 Nombre de personnes : {getReservationQuantity(res)}
                      </p>
                      {res.notes && (
                        <p className="text-muted text-sm italic">
                          📝 Note : {getReservationNote(res)}
                        </p>
                      )}
                      {res.price === 0 && (
                        <p className="text-success text-sm font-medium">
                          ✅ 100% gratuit
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* ✅ Actions pour les réservations en attente et non expirées */}
                {res.status === 'pending' && !isReservationExpired(res) && (
                  <div className="mt-4 flex flex-wrap gap-4 pt-4 border-t border-border">
                    <button
                      onClick={() => handleAccept(res._id)}
                      className="btn btn-primary"
                    >
                      ✅ Confirmer
                    </button>
                    <button
                      onClick={() => handleReject(res._id)}
                      className="btn btn-error"
                    >
                      ❌ Refuser
                    </button>
                  </div>
                )}

                {/* ✅ Message pour les réservations expirées */}
                {res.status === 'pending' && isReservationExpired(res) && (
                  <div className="mt-4 pt-4 border-t border-border">
                    <p className="text-error text-sm">
                      ⚠️ Cette réservation a expiré et ne peut plus être confirmée.
                    </p>
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