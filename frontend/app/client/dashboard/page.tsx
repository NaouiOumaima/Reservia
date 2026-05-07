// app/client/dashboard/page.tsx
'use client';

import { useAuth } from '@/providers/AuthProvider';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import {
  SearchIcon,
  MapIcon,
  BookingIcon,
  HeartIcon,
  CalendarIcon,
  StarIcon,
} from '@/components/ui/Icons';

export default function ClientDashboard() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'client')) {
      router.push('/');
    }
  }, [user, isLoading, router]);

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

  // Données fictives pour le dashboard
  const upcomingBookings = [
    { id: 1, service: 'Coiffure', date: '2024-05-15', time: '14:00', status: 'confirmé' },
    { id: 2, service: 'Restaurant', date: '2024-05-18', time: '20:00', status: 'en attente' },
  ];

  const recentActivities = [
    { id: 1, action: 'Réservation annulée', service: 'Salle de sport', date: '2024-05-10' },
    { id: 2, action: 'Nouvel avis', service: 'Coiffure', date: '2024-05-09' },
  ];

  return (
    <div className="min-h-screen bg-[rgb(var(--background))]">
      <div className="container-app py-8">
        {/* En-tête */}
        <div className="mb-8">
          <h1 className="text-3xl font-display text-[rgb(var(--foreground))] mb-2">
            Bonjour {user.firstName} ! 👋
          </h1>
          <p className="text-[rgb(var(--foreground-muted))]">
            Bienvenue sur votre espace client. Découvrez vos réservations et services à proximité.
          </p>
        </div>

        {/* Actions rapides */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
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
        </div>

        {/* Deux colonnes */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Réservations à venir */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-display text-[rgb(var(--foreground))]">
                Réservations à venir
              </h2>
              <Link href="/client/bookings" className="text-sm text-[rgb(var(--primary))] hover:underline">
                Voir tout
              </Link>
            </div>
            {upcomingBookings.length > 0 ? (
              <div className="space-y-3">
                {upcomingBookings.map((booking) => (
                  <div key={booking.id} className="flex items-center justify-between p-3 bg-[rgba(var(--primary),0.05)] rounded-lg">
                    <div>
                      <p className="font-semibold text-[rgb(var(--foreground))]">{booking.service}</p>
                      <p className="text-sm text-[rgb(var(--foreground-muted))]">
                        {booking.date} à {booking.time}
                      </p>
                    </div>
                    <span className={`badge ${
                      booking.status === 'confirmé' ? 'badge-success' : 'badge-warning'
                    }`}>
                      {booking.status}
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

          {/* Activités récentes */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-display text-[rgb(var(--foreground))]">
                Activités récentes
              </h2>
              <Link href="/client/profile" className="text-sm text-[rgb(var(--primary))] hover:underline">
                Voir tout
              </Link>
            </div>
            {recentActivities.length > 0 ? (
              <div className="space-y-3">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-center gap-3 p-3 bg-[rgba(var(--primary),0.05)] rounded-lg">
                    <div className="w-8 h-8 rounded-full bg-[rgb(var(--primary))] flex items-center justify-center">
                      <CalendarIcon className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-[rgb(var(--foreground))]">{activity.action}</p>
                      <p className="text-sm text-[rgb(var(--foreground-muted))]">
                        {activity.service} - {activity.date}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-[rgb(var(--foreground-muted))] py-8">
                Aucune activité récente
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}