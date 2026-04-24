// app/client/dashboard/page.tsx

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { User, Reservation, Service } from '@/types';

export default function ClientDashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [favorites, setFavorites] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get user from localStorage
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
            Bienvenue sur votre espace client. Gérez vos réservations et découvertes.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Link
            href="/search"
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
          >
            <div className="text-4xl mb-3">🔍</div>
            <h3 className="font-semibold text-gray-900 dark:text-white">Rechercher</h3>
            <p className="text-sm text-gray-500">Trouver un service</p>
          </Link>
          <Link
            href="/map"
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
          >
            <div className="text-4xl mb-3">📍</div>
            <h3 className="font-semibold text-gray-900 dark:text-white">Carte</h3>
            <p className="text-sm text-gray-500">Services à proximité</p>
          </Link>
          <Link
            href="/client/bookings"
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
          >
            <div className="text-4xl mb-3">📅</div>
            <h3 className="font-semibold text-gray-900 dark:text-white">Réservations</h3>
            <p className="text-sm text-gray-500">Mes rendez-vous</p>
          </Link>
          <Link
            href="/client/favorites"
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
          >
            <div className="text-4xl mb-3">❤️</div>
            <h3 className="font-semibold text-gray-900 dark:text-white">Favoris</h3>
            <p className="text-sm text-gray-500">Services aimés</p>
          </Link>
        </div>

        {/* Recent Reservations */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Réservations à venir
            </h2>
            <Link
              href="/client/bookings"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Voir tout →
            </Link>
          </div>
          <div className="space-y-4">
            {reservations.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                Aucune réservation.{' '}
                <Link href="/search" className="text-blue-600 hover:underline">
                  Découvrir des services
                </Link>
              </p>
            ) : (
              reservations.slice(0, 3).map((reservation) => (
                <div
                  key={reservation._id}
                  className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
                >
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                      {reservation.serviceName}
                    </h4>
                    <p className="text-sm text-gray-500">{reservation.providerName}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900 dark:text-white">
                      {reservation.date?.toLocaleDateString('fr-FR')}
                    </p>
                    <p className="text-sm text-gray-500">{reservation.startTime}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recommended Services */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Recommandés pour vous
            </h2>
            <Link
              href="/search"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Explorer plus →
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <p className="text-gray-500 text-center py-8 col-span-3">
              Chargez vos préférences pour obtenir des recommandations personnalisées.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}