'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { servicesApi } from '@/lib/api/services';
import { reservationsApi } from '@/lib/api/reservations';
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
        const reservations = await reservationsApi.getProviderReservations();
        
        setStats({
          totalServices: services.length,
          pendingBookings: reservations.filter(r => r.status === 'pending').length,
          confirmedBookings: reservations.filter(r => r.status === 'confirmed').length,
          totalRevenue: reservations.filter(r => r.status === 'completed').reduce((sum, r) => sum + r.price, 0),
          averageRating: 4.5, // À remplacer par API
        });
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <div className="flex justify-center py-12"><div className="spinner" /></div>;

  return (
    <div className="min-h-screen bg-surface">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="card p-6 mb-8">
          <h1 className="text-2xl font-bold">Tableau de bord</h1>
          <p className="text-muted mt-2">Bienvenue sur votre espace fournisseur</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <div className="card text-center"><ServicesIcon className="w-8 h-8 text-primary mx-auto mb-2" /><p className="text-2xl font-bold">{stats.totalServices}</p><p className="text-sm">Services</p></div>
          <div className="card text-center"><CalendarIcon className="w-8 h-8 text-warning mx-auto mb-2" /><p className="text-2xl font-bold">{stats.pendingBookings}</p><p className="text-sm">En attente</p></div>
          <div className="card text-center"><CalendarIcon className="w-8 h-8 text-success mx-auto mb-2" /><p className="text-2xl font-bold">{stats.confirmedBookings}</p><p className="text-sm">Confirmées</p></div>
          <div className="card text-center"><ServicesIcon className="w-8 h-8 text-primary mx-auto mb-2" /><p className="text-2xl font-bold">{stats.totalRevenue} DT</p><p className="text-sm">Revenus</p></div>
          <div className="card text-center"><StarIcon className="w-8 h-8 text-warning mx-auto mb-2" /><p className="text-2xl font-bold">{stats.averageRating.toFixed(1)}</p><p className="text-sm">Note moyenne</p></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Link href="/provider/services" className="card text-center"><ServicesIcon className="w-10 h-10 text-primary mx-auto mb-3" /><h3 className="font-semibold">Mes services</h3><p className="text-sm text-muted">Gérer</p></Link>
          <Link href="/provider/location" className="card text-center"><LocationIcon className="w-10 h-10 text-primary mx-auto mb-3" /><h3 className="font-semibold">Localisation</h3><p className="text-sm text-muted">Ma position</p></Link>
          <Link href="/provider/availability" className="card text-center"><CalendarIcon className="w-10 h-10 text-primary mx-auto mb-3" /><h3 className="font-semibold">Disponibilités</h3><p className="text-sm text-muted">Créneaux</p></Link>
          <Link href="/provider/bookings" className="card text-center"><CalendarIcon className="w-10 h-10 text-primary mx-auto mb-3" /><h3 className="font-semibold">Réservations</h3><p className="text-sm text-muted">Commandes</p></Link>
        </div>
      </div>
    </div>
  );
}