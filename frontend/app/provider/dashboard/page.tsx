// app/provider/dashboard/page.tsx
'use client';

import { useAuth } from '@/providers/AuthProvider';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import {
  ServicesIcon,
  BookingIcon,
  LocationIcon,
  ClockIcon,
  ReviewIcon,
  TrendingUpIcon,
} from '@/components/ui/Icons';

export default function ProviderDashboard() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'provider')) {
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

  if (!user || user.role !== 'provider') {
    return null;
  }

  // Données fictives
  const stats = [
    { label: 'Services actifs', value: '12', icon: <ServicesIcon className="w-6 h-6" />, change: '+2' },
    { label: 'Réservations ce mois', value: '48', icon: <BookingIcon className="w-6 h-6" />, change: '+15%' },
    { label: 'Note moyenne', value: '4.8', icon: <ReviewIcon className="w-6 h-6" />, change: '+0.3' },
    { label: 'Taux d\'occupation', value: '85%', icon: <TrendingUpIcon className="w-6 h-6" />, change: '+12%' },
  ];

  const recentBookings = [
    { id: 1, client: 'Marie D.', service: 'Coupe femme', date: '2024-05-15', time: '14:00', status: 'confirmé' },
    { id: 2, client: 'Thomas L.', service: 'Massage', date: '2024-05-15', time: '16:30', status: 'en attente' },
    { id: 3, client: 'Sophie M.', service: 'Manucure', date: '2024-05-16', time: '10:00', status: 'confirmé' },
  ];

  return (
    <div className="min-h-screen bg-[rgb(var(--background))]">
      <div className="container-app py-8">
        {/* En-tête */}
        <div className="mb-8">
          <h1 className="text-3xl font-display text-[rgb(var(--foreground))] mb-2">
            Tableau de bord
          </h1>
          <p className="text-[rgb(var(--foreground-muted))]">
            Bienvenue {user.firstName} ! Voici un aperçu de votre activité.
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
                <span className="text-sm font-semibold text-green-600 bg-green-100 px-2 py-1 rounded">
                  {stat.change}
                </span>
              </div>
              <p className="text-2xl font-display text-[rgb(var(--foreground))] mb-1">{stat.value}</p>
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
                {recentBookings.map((booking) => (
                  <tr key={booking.id} className="border-b border-[rgb(var(--border))] hover:bg-[rgba(var(--primary),0.05)] transition-colors">
                    <td className="py-3 px-4 text-[rgb(var(--foreground))]">{booking.client}</td>
                    <td className="py-3 px-4 text-[rgb(var(--foreground))]">{booking.service}</td>
                    <td className="py-3 px-4 text-[rgb(var(--foreground-muted))]">{booking.date}</td>
                    <td className="py-3 px-4 text-[rgb(var(--foreground-muted))]">{booking.time}</td>
                    <td className="py-3 px-4">
                      <span className={`badge ${
                        booking.status === 'confirmé' ? 'badge-success' : 'badge-warning'
                      }`}>
                        {booking.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}