// app/client/bookings/page.tsx

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Reservation } from '@/types';

export default function ClientBookingsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past'>('all');

  useEffect(() => {
    // Simulated data - replace with API call
    setLoading(false);
  }, []);

  const filteredReservations = reservations.filter((res) => {
    if (filter === 'upcoming') return new Date(res.date!) > new Date();
    if (filter === 'past') return new Date(res.date!) <= new Date();
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Mes Réservations
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            Gérez vos réservations passées et à venir
          </p>
        </div>

        {/* Filters */}
        <div className="flex space-x-4 mb-6">
          {(['all', 'upcoming', 'past'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === f
                  ? 'bg-blue-600 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              {f === 'all' ? 'Toutes' : f === 'upcoming' ? 'À venir' : 'Passées'}
            </button>
          ))}
        </div>

        {/* Reservations List */}
        <div className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredReservations.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-12 text-center">
              <div className="text-6xl mb-4">📅</div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Aucune réservation
              </h3>
              <p className="text-gray-500 mb-6">
                {filter === 'upcoming'
                  ? "Vous n'avez pas de réservations à venir"
                  : filter === 'past'
                  ? "Vous n'avez pas de réservations passées"
                  : "Vous n'avez pas encore de réservations"}
              </p>
              <Link
                href="/search"
                className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
              >
                Découvrir des services
              </Link>
            </div>
          ) : (
            filteredReservations.map((reservation) => (
              <div
                key={reservation._id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          reservation.status === 'confirmed'
                            ? 'bg-green-100 text-green-800'
                            : reservation.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : reservation.status === 'completed'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {reservation.status === 'confirmed'
                          ? 'Confirmée'
                          : reservation.status === 'pending'
                          ? 'En attente'
                          : reservation.status === 'completed'
                          ? 'Terminée'
                          : 'Annulée'}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {reservation.serviceName}
                    </h3>
                    <p className="text-gray-500">{reservation.providerName}</p>
                  </div>
                  <div className="mt-4 md:mt-0 md:ml-8">
                    <p className="font-medium text-gray-900 dark:text-white">
                      {reservation.date?.toLocaleDateString('fr-FR')}
                    </p>
                    <p className="text-gray-500">
                      {reservation.startTime} - {reservation.endTime}
                    </p>
                    <p className="text-blue-600 font-medium mt-1">
                      {reservation.price} DT
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex space-x-4">
                  <Link
                    href={`/service/${reservation.serviceId}`}
                    className="text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Voir le service
                  </Link>
                  {reservation.status === 'confirmed' && (
                    <button className="text-red-600 hover:text-red-700 font-medium">
                      Annuler
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}