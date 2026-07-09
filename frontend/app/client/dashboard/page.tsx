// app/client/dashboard/page.tsx
'use client';

import { useAuth } from '@/providers/AuthProvider';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { dashboardApi, ClientDashboardSummary } from '@/lib/api/dash';
import { useSocket } from '@/hooks/useSocket';
import { RESERVATION_STATUS_LABELS, RESERVATION_STATUS_BADGES } from '@/lib/helpers/reservationStatus';
import {
  SearchIcon,
  MapIcon,
  BookingIcon,
  HeartIcon,
  CalendarIcon,
  BellIcon,
  ReviewIcon,
} from '@/components/ui/Icons';

export default function ClientDashboard() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const { socket } = useSocket();
  const [summary, setSummary] = useState<ClientDashboardSummary | null>(null);
  const [loadingSummary, setLoadingSummary] = useState(true);

  const fetchSummary = useCallback(async () => {
    try {
      const data = await dashboardApi.getClientDashboard();
      setSummary(data);
    } catch (error) {
      console.error('Erreur chargement dashboard client:', error);
    } finally {
      setLoadingSummary(false);
    }
  }, []);

  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'client')) {
      router.push('/');
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    if (user?.role === 'client') {
      fetchSummary();
    }
  }, [user, fetchSummary]);

  // Mise à jour temps réel : nouvelle notification ou changement de statut
  // de réservation rafraîchissent le résumé sans rechargement de page.
  useEffect(() => {
    if (!socket) return;

    const handleUpdate = () => fetchSummary();

    socket.on('reservation_updated', handleUpdate);
    socket.on('new_notification', handleUpdate);

    return () => {
      socket.off('reservation_updated', handleUpdate);
      socket.off('new_notification', handleUpdate);
    };
  }, [socket, fetchSummary]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[rgb(var(--background))]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[rgb(var(--primary))]"></div>
      </div>
    );
  }

  if (!user || user.role !== 'client') {
    return null;
  }

  const formatDateTime = (date: string | Date) =>
    new Date(date).toLocaleString('fr-FR', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });

  return (
    <div className="min-h-screen bg-[rgb(var(--background))]">
      <div className="container-app py-8">
        {/* En-tête */}
        <div className="mb-8">
          <h1 className="text-3xl font-display text-[rgb(var(--foreground))] mb-2">
            Bonjour {user.firstName} !
          </h1>
          <p className="text-[rgb(var(--foreground-muted))]">
            Bienvenue sur votre espace client. Découvrez vos réservations et services à proximité.
          </p>
        </div>

        {/* Actions rapides */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <Link href="/search" className="card hover-lift p-4 text-center group">
            <div className="w-12 h-12 rounded-full bg-[rgba(var(--primary),0.1)] flex items-center justify-center mx-auto mb-3 text-[rgb(var(--primary))] group-hover:scale-110 transition-transform">
              <SearchIcon className="w-6 h-6" />
            </div>
            <span className="font-semibold text-[rgb(var(--foreground))]">Rechercher</span>
          </Link>

          <Link href="/client/carte" className="card hover-lift p-4 text-center group">
            <div className="w-12 h-12 rounded-full bg-[rgba(var(--primary),0.1)] flex items-center justify-center mx-auto mb-3 text-[rgb(var(--primary))] group-hover:scale-110 transition-transform">
              <MapIcon className="w-6 h-6" />
            </div>
            <span className="font-semibold text-[rgb(var(--foreground))]">Carte</span>
          </Link>

          <Link href="/client/bookings" className="card hover-lift p-4 text-center group">
            <div className="w-12 h-12 rounded-full bg-[rgba(var(--primary),0.1)] flex items-center justify-center mx-auto mb-3 text-[rgb(var(--primary))] group-hover:scale-110 transition-transform">
              <BookingIcon className="w-6 h-6" />
            </div>
            <span className="font-semibold text-[rgb(var(--foreground))]">Réservations</span>
          </Link>

          <Link href="/client/favorites" className="card hover-lift p-4 text-center group">
            <div className="w-12 h-12 rounded-full bg-[rgba(var(--primary),0.1)] flex items-center justify-center mx-auto mb-3 text-[rgb(var(--primary))] group-hover:scale-110 transition-transform">
              <HeartIcon className="w-6 h-6" />
            </div>
            <span className="font-semibold text-[rgb(var(--foreground))]">Favoris</span>
          </Link>

          <Link href="/client/reviews" className="card hover-lift p-4 text-center group">
            <div className="w-12 h-12 rounded-full bg-[rgba(var(--primary),0.1)] flex items-center justify-center mx-auto mb-3 text-[rgb(var(--primary))] group-hover:scale-110 transition-transform">
              <ReviewIcon className="w-6 h-6" />
            </div>
            <span className="font-semibold text-[rgb(var(--foreground))]">Mes avis</span>
          </Link>
        </div>

        {/* Deux colonnes */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Réservations à venir */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-display text-[rgb(var(--foreground))]">
                Réservations à venir
                {summary && summary.upcomingCount > 0 && (
                  <span className="ml-2 text-sm text-[rgb(var(--foreground-muted))]">
                    ({summary.upcomingCount})
                  </span>
                )}
              </h2>
              <Link href="/client/bookings" className="text-sm text-[rgb(var(--primary))] hover:underline">
                Voir tout
              </Link>
            </div>
            {loadingSummary ? (
              <div className="flex justify-center py-8"><div className="spinner" /></div>
            ) : summary && summary.upcomingReservations.length > 0 ? (
              <div className="space-y-3">
                {summary.upcomingReservations.map((booking: any) => (
                  <div key={booking._id} className="flex items-center justify-between p-3 bg-[rgba(var(--primary),0.05)] rounded-lg">
                    <div>
                      <p className="font-semibold text-[rgb(var(--foreground))]">
                        {booking.serviceId?.name || 'Service'}
                      </p>
                      <p className="text-sm text-[rgb(var(--foreground-muted))]">
                        {formatDateTime(booking.startTime)}
                      </p>
                    </div>
                    <span className={`badge ${RESERVATION_STATUS_BADGES[booking.status] || 'badge'}`}>
                      {RESERVATION_STATUS_LABELS[booking.status] || booking.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-[rgb(var(--foreground-muted))] py-8">
                Aucune réservation à venir
              </p>
            )}
          </div>

          {/* Dernière notification */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-display text-[rgb(var(--foreground))]">
                Dernière notification
              </h2>
              <Link href="/notifications" className="text-sm text-[rgb(var(--primary))] hover:underline">
                Voir tout
              </Link>
            </div>
            {loadingSummary ? (
              <div className="flex justify-center py-8"><div className="spinner" /></div>
            ) : summary?.lastNotification ? (
              <div className="flex items-start gap-3 p-3 bg-[rgba(var(--primary),0.05)] rounded-lg">
                <div className="w-8 h-8 shrink-0 rounded-full bg-[rgb(var(--primary))] flex items-center justify-center">
                  <BellIcon className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-[rgb(var(--foreground))]">
                    {summary.lastNotification.title}
                  </p>
                  <p className="text-sm text-[rgb(var(--foreground-muted))]">
                    {summary.lastNotification.message}
                  </p>
                  <p className="text-xs text-[rgb(var(--foreground-muted))] mt-1">
                    {formatDateTime(summary.lastNotification.createdAt)}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-center text-[rgb(var(--foreground-muted))] py-8 flex flex-col items-center gap-2">
                <CalendarIcon className="w-8 h-8 opacity-40" />
                Aucune notification récente
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
