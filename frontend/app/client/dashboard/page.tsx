'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { User, Reservation } from '@/types';
import { reservationsApi } from '@/lib/api/reservations';
import { ServicesIcon, CalendarIcon, StarIcon, LocationIcon, MenuIcon } from '@/components/ui/Icons';

export default function ClientDashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [upcomingReservations, setUpcomingReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const storedUser = localStorage.getItem('user');
        if (storedUser) setUser(JSON.parse(storedUser));
        
        const reservations = await reservationsApi.getMyReservations();
        setUpcomingReservations(reservations.filter(r => r.status === 'confirmed' && new Date(r.date!) > new Date()).slice(0, 3));
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return <div className="flex justify-center py-12"><div className="spinner" /></div>;
  }

  return (
    <div className="min-h-screen bg-surface">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="card p-6 mb-8">
          <h1 className="text-2xl font-bold text-foreground">Bonjour, {user?.firstName} !</h1>
          <p className="text-muted mt-2">Bienvenue sur votre espace client.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Link href="/search" className="card p-6 hover:shadow-md transition-shadow text-center">
            <SearchIcon className="w-10 h-10 text-primary mx-auto mb-3" />
            <h3 className="font-semibold">Rechercher</h3>
            <p className="text-sm text-muted">Trouver un service</p>
          </Link>
          <Link href="/client/carte" className="card p-6 hover:shadow-md transition-shadow text-center">
            <MapIcon className="w-10 h-10 text-primary mx-auto mb-3" />
            <h3 className="font-semibold">Carte</h3>
            <p className="text-sm text-muted">Services à proximité</p>
          </Link>
          <Link href="/client/bookings" className="card p-6 hover:shadow-md transition-shadow text-center">
            <CalendarIcon className="w-10 h-10 text-primary mx-auto mb-3" />
            <h3 className="font-semibold">Réservations</h3>
            <p className="text-sm text-muted">Mes rendez-vous</p>
          </Link>
          <Link href="/client/favorites" className="card p-6 hover:shadow-md transition-shadow text-center">
            <StarIcon className="w-10 h-10 text-primary mx-auto mb-3" />
            <h3 className="font-semibold">Favoris</h3>
            <p className="text-sm text-muted">Services aimés</p>
          </Link>
        </div>

        <div className="card p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-foreground">Réservations à venir</h2>
            <Link href="/client/bookings" className="text-primary hover:underline">Voir tout →</Link>
          </div>
          {upcomingReservations.length === 0 ? (
            <p className="text-muted text-center py-8">Aucune réservation.</p>
          ) : (
            <div className="space-y-4">
              {upcomingReservations.map(res => (
                <div key={res._id} className="flex justify-between items-center p-4 border border-border rounded-lg">
                  <div>
                    <h4 className="font-semibold">{res.serviceName}</h4>
                    <p className="text-sm text-muted">{res.providerName}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{new Date(res.date!).toLocaleDateString('fr-FR')}</p>
                    <p className="text-sm text-muted">{res.startTime}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

import { SearchIcon, MapIcon } from '@/components/ui/Icons';