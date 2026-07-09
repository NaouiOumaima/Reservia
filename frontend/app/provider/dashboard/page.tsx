// app/provider/dashboard/page.tsx
'use client';

import { useAuth } from '@/providers/AuthProvider';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { dashboardApi } from '@/lib/api/dash';
import { DashboardSummary } from '@/lib/api/dash/types';
import { reservationsApi, Reservation } from '@/lib/api/reservations';
import { useSocket } from '@/hooks/useSocket';
import { RESERVATION_STATUS_LABELS, RESERVATION_STATUS_BADGES } from '@/lib/helpers/reservationStatus';
import {
  ServicesIcon,
  BookingIcon,
  LocationIcon,
  ClockIcon,
  ReviewIcon,
  AlertTriangleIcon,
} from '@/components/ui/Icons';

export default function ProviderDashboard() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const { socket } = useSocket();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [bookings, setBookings] = useState<Reservation[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const [dashboardRes, reservations] = await Promise.all([
        dashboardApi.getProviderDashboard('day'),
        reservationsApi.getProviderReservations(),
      ]);
      setSummary(dashboardRes.summary);
      setBookings(reservations.slice(0, 5));
    } catch (error) {
      console.error('Erreur chargement dashboard provider:', error);
    } finally {
      setLoadingData(false);
    }
  }, []);

  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'provider')) {
      router.push('/');
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    if (user?.role === 'provider') {
      fetchData();
    }
  }, [user, fetchData]);

  // Mise à jour temps réel des réservations sans rechargement de page
  useEffect(() => {
    if (!socket) return;
    const handleUpdate = () => fetchData();
    socket.on('reservation_updated', handleUpdate);
    return () => {
      socket.off('reservation_updated', handleUpdate);
    };
  }, [socket, fetchData]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[rgb(var(--background))]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[rgb(var(--primary))]"></div>
      </div>
    );
  }

  if (!user || user.role !== 'provider') {
    return null;
  }

  const stats = [
    {
      label: 'Réservations aujourd\'hui',
      value: summary?.todayReservationsCount ?? 0,
      icon: <BookingIcon className="w-6 h-6" />,
    },
    {
      label: 'Alertes en attente',
      value: summary?.pendingReservations ?? 0,
      icon: <AlertTriangleIcon className="w-6 h-6" />,
    },
    {
      label: 'Note moyenne',
      value: summary?.avgRating ? summary.avgRating.toFixed(1) : '—',
      icon: <ReviewIcon className="w-6 h-6" />,
    },
    {
      label: 'Services',
      value: summary?.servicesCount ?? 0,
      icon: <ServicesIcon className="w-6 h-6" />,
    },
  ];

  const formatDate = (date: string | Date) => new Date(date).toLocaleDateString('fr-FR');
  const formatTime = (date: string | Date) =>
    new Date(date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="min-h-screen bg-[rgb(var(--background))]">
      <div className="container-app py-8">
        {/* En-tête */}
        <div className="mb-8">
          <h1 className="text-3xl font-display text-[rgb(var(--foreground))] mb-2">
            Tableau de bord
          </h1>
          <p className="text-[rgb(var(--foreground-muted))]">
            Bienvenue {user.firstName} ! Voici un aperçu de votre activité du jour.
          </p>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat) => (
            <div key={stat.label} className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-full bg-[rgba(var(--primary),0.1)] flex items-center justify-center text-[rgb(var(--primary))]">
                  {stat.icon}
                </div>
              </div>
              <p className="text-2xl font-display text-[rgb(var(--foreground))] mb-1">
                {loadingData ? '…' : stat.value}
              </p>
              <p className="text-sm text-[rgb(var(--foreground-muted))]">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Actions rapides */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Link href="/provider/services" className="card hover-lift p-4 text-center group">
            <div className="w-12 h-12 rounded-full bg-[rgba(var(--primary),0.1)] flex items-center justify-center mx-auto mb-3 text-[rgb(var(--primary))] group-hover:scale-110 transition-transform">
              <ServicesIcon className="w-6 h-6" />
            </div>
            <span className="font-semibold text-[rgb(var(--foreground))]">Gérer services</span>
          </Link>

          <Link href="/provider/availability" className="card hover-lift p-4 text-center group">
            <div className="w-12 h-12 rounded-full bg-[rgba(var(--primary),0.1)] flex items-center justify-center mx-auto mb-3 text-[rgb(var(--primary))] group-hover:scale-110 transition-transform">
              <ClockIcon className="w-6 h-6" />
            </div>
            <span className="font-semibold text-[rgb(var(--foreground))]">Disponibilités</span>
          </Link>

          <Link href="/provider/location" className="card hover-lift p-4 text-center group">
            <div className="w-12 h-12 rounded-full bg-[rgba(var(--primary),0.1)] flex items-center justify-center mx-auto mb-3 text-[rgb(var(--primary))] group-hover:scale-110 transition-transform">
              <LocationIcon className="w-6 h-6" />
            </div>
            <span className="font-semibold text-[rgb(var(--foreground))]">Localisation</span>
          </Link>

          <Link href="/provider/bookings" className="card hover-lift p-4 text-center group">
            <div className="w-12 h-12 rounded-full bg-[rgba(var(--primary),0.1)] flex items-center justify-center mx-auto mb-3 text-[rgb(var(--primary))] group-hover:scale-110 transition-transform">
              <BookingIcon className="w-6 h-6" />
            </div>
            <span className="font-semibold text-[rgb(var(--foreground))]">Réservations</span>
          </Link>
        </div>

        {/* Réservations récentes */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-display text-[rgb(var(--foreground))]">
              Réservations récentes
            </h2>
            <Link href="/provider/bookings" className="text-sm text-[rgb(var(--primary))] hover:underline">
              Voir toutes
            </Link>
          </div>
          {loadingData ? (
            <div className="flex justify-center py-8"><div className="spinner" /></div>
          ) : bookings.length === 0 ? (
            <p className="text-center text-[rgb(var(--foreground-muted))] py-8">
              Aucune réservation pour le moment
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[rgb(var(--border))]">
                    <th className="text-left py-3 px-4 text-[rgb(var(--foreground-muted))] font-semibold">Client</th>
                    <th className="text-left py-3 px-4 text-[rgb(var(--foreground-muted))] font-semibold">Service</th>
                    <th className="text-left py-3 px-4 text-[rgb(var(--foreground-muted))] font-semibold">Date</th>
                    <th className="text-left py-3 px-4 text-[rgb(var(--foreground-muted))] font-semibold">Heure</th>
                    <th className="text-left py-3 px-4 text-[rgb(var(--foreground-muted))] font-semibold">Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((booking) => (
                    <tr key={booking._id} className="border-b border-[rgb(var(--border))] hover:bg-[rgba(var(--primary),0.05)] transition-colors">
                      <td className="py-3 px-4 text-[rgb(var(--foreground))]">{booking.customerInfo?.name || '—'}</td>
                      <td className="py-3 px-4 text-[rgb(var(--foreground))]">{booking.serviceName}</td>
                      <td className="py-3 px-4 text-[rgb(var(--foreground-muted))]">{formatDate(booking.startTime)}</td>
                      <td className="py-3 px-4 text-[rgb(var(--foreground-muted))]">{formatTime(booking.startTime)}</td>
                      <td className="py-3 px-4">
                        <span className={`badge ${RESERVATION_STATUS_BADGES[booking.status] || 'badge'}`}>
                          {RESERVATION_STATUS_LABELS[booking.status] || booking.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
