// app/provider/dashboard/page.tsx

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { User, Reservation, Service } from '@/types';

export default function ProviderDashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState({
    totalServices: 0,
    pendingBookings: 0,
    confirmedBookings: 0,
    totalRevenue: 0,
    averageRating: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Bonjour, {user?.firstName} ! 👋
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Bienvenue sur votre espace fournisseur. Gérez vos services et réservations.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <div className="text-3xl mb-2">📊</div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalServices}</p>
            <p className="text-sm text-gray-500">Services</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <div className="text-3xl mb-2">⏳</div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.pendingBookings}</p>
            <p className="text-sm text-gray-500">En attente</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <div className="text-3xl mb-2">✅</div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.confirmedBookings}</p>
            <p className="text-sm text-gray-500">Confirmées</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <div className="text-3xl mb-2">💰</div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalRevenue} DT</p>
            <p className="text-sm text-gray-500">Revenus</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <div className="text-3xl mb-2">⭐</div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.averageRating.toFixed(1)}</p>
            <p className="text-sm text-gray-500">Note moyenne</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Link
            href="/provider/services"
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
          >
            <div className="text-4xl mb-3">🏪</div>
            <h3 className="font-semibold text-gray-900 dark:text-white">Mes services</h3>
            <p className="text-sm text-gray-500">Gérer mes services</p>
          </Link>
          <Link
            href="/provider/location"
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
          >
            <div className="text-4xl mb-3">📍</div>
            <h3 className="font-semibold text-gray-900 dark:text-white">Localisation</h3>
            <p className="text-sm text-gray-500">Ma position sur la carte</p>
          </Link>
          <Link
            href="/provider/availability"
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
          >
            <div className="text-4xl mb-3">🗓️</div>
            <h3 className="font-semibold text-gray-900 dark:text-white">Disponibilités</h3>
            <p className="text-sm text-gray-500">Gérer les créneaux</p>
          </Link>
          <Link
            href="/provider/bookings"
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
          >
            <div className="text-4xl mb-3">📅</div>
            <h3 className="font-semibold text-gray-900 dark:text-white">Réservations</h3>
            <p className="text-sm text-gray-500">Voir les commandes</p>
          </Link>
        </div>

        {/* Recent Bookings */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Réservations récentes
            </h2>
            <Link
              href="/provider/bookings"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Voir tout →
            </Link>
          </div>
          <p className="text-gray-500 text-center py-8">
            Aucune réservation récente.
          </p>
        </div>
      </div>
    </div>
  );
}