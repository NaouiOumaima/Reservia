// app/provider/dashboard/page.tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { servicesApi } from '@/lib/api';
// ❌ Supprimez cette ligne
// import { reservationsApi } from '@/lib/api/reservations';
import { ServicesIcon, CalendarIcon, StarIcon, LocationIcon } from '@/components/ui/Icons';

export default function ProviderDashboardPage() {
  const [stats, setStats] = useState({
    totalServices: 0,
    pendingBookings: 0,
    confirmedBookings: 0,
    totalRevenue: 0,
    averageRating: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const services = await servicesApi.getByProvider();
        
        // Commentez ou supprimez l'appel à reservationsApi
        // const reservations = await reservationsApi.getProviderReservations();
        
        setStats({
          totalServices: services.length,
          pendingBookings: 0, // reservations.filter(r => r.status === 'pending').length,
          confirmedBookings: 0, // reservations.filter(r => r.status === 'confirmed').length,
          totalRevenue: 0, // reservations.filter(r => r.status === 'completed').reduce((sum, r) => sum + r.price, 0),
          averageRating: 4.5,
        });
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="card p-6 mb-8">
          <h1 className="text-2xl font-bold text-foreground">Tableau de bord</h1>
          <p className="text-muted mt-2">Bienvenue sur votre espace fournisseur</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <div className="card text-center">
            <ServicesIcon className="w-8 h-8 text-primary mx-auto mb-2" />
            <p className="text-2xl font-bold text-foreground">{stats.totalServices}</p>
            <p className="text-sm text-muted">Services</p>
          </div>
          <div className="card text-center">
            <CalendarIcon className="w-8 h-8 text-warning mx-auto mb-2" />
            <p className="text-2xl font-bold text-foreground">{stats.pendingBookings}</p>
            <p className="text-sm text-muted">En attente</p>
          </div>
          <div className="card text-center">
            <CalendarIcon className="w-8 h-8 text-success mx-auto mb-2" />
            <p className="text-2xl font-bold text-foreground">{stats.confirmedBookings}</p>
            <p className="text-sm text-muted">Confirmées</p>
          </div>
          <div className="card text-center">
            <ServicesIcon className="w-8 h-8 text-primary mx-auto mb-2" />
            <p className="text-2xl font-bold text-foreground">{stats.totalRevenue} DT</p>
            <p className="text-sm text-muted">Revenus</p>
          </div>
          <div className="card text-center">
            <StarIcon className="w-8 h-8 text-warning mx-auto mb-2" />
            <p className="text-2xl font-bold text-foreground">{stats.averageRating.toFixed(1)}</p>
            <p className="text-sm text-muted">Note moyenne</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Link href="/provider/services" className="card text-center hover:shadow-md transition-shadow">
            <ServicesIcon className="w-10 h-10 text-primary mx-auto mb-3" />
            <h3 className="font-semibold text-foreground">Mes services</h3>
            <p className="text-sm text-muted">Gérer mes services</p>
          </Link>
          <Link href="/provider/location" className="card text-center hover:shadow-md transition-shadow">
            <LocationIcon className="w-10 h-10 text-primary mx-auto mb-3" />
            <h3 className="font-semibold text-foreground">Localisation</h3>
            <p className="text-sm text-muted">Ma position sur la carte</p>
          </Link>
          <Link href="/provider/availability" className="card text-center hover:shadow-md transition-shadow">
            <CalendarIcon className="w-10 h-10 text-primary mx-auto mb-3" />
            <h3 className="font-semibold text-foreground">Disponibilités</h3>
            <p className="text-sm text-muted">Gérer les créneaux</p>
          </Link>
          <Link href="/provider/bookings" className="card text-center hover:shadow-md transition-shadow">
            <CalendarIcon className="w-10 h-10 text-primary mx-auto mb-3" />
            <h3 className="font-semibold text-foreground">Réservations</h3>
            <p className="text-sm text-muted">Voir les commandes</p>
          </Link>
        </div>
      </div>
    </div>
  );
}