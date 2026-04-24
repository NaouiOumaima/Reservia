// app/provider/bookings/page.tsx

'use client';

import { useEffect, useState } from 'react';
import { Reservation } from '@/types';

export default function ProviderBookingsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | 'completed' | 'cancelled'>('all');

  useEffect(() => {
    // Simulated data - replace with API call
    setLoading(false);
  }, []);

  const filteredReservations = reservations.filter((res) => {
    if (filter === 'all') return true;
    return res.status === filter;
  });

  const updateStatus = (reservationId: string, status: Reservation['status']) => {
    setReservations(reservations.map(res => 
      res._id === reservationId ? { ...res, status } : res
    ));
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Réservations reçues
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            Voir et gérer les commandes
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-6">
          {(['all', 'pending', 'confirmed', 'completed', 'cancelled'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === f
                  ? 'bg-blue-600 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              {f === 'all' ? 'Toutes' : 
               f === 'pending' ? 'En attente' :
               f === 'confirmed' ? 'Confirmées' :
               f === 'completed' ? 'Terminées' : 'Annulées'}
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
              <p className="text-gray-500">
                {filter === 'all' 
                  ? "Vous n'avez pas encore de réservations"
                  : `Aucune réservation ${filter === 'pending' ? 'en attente' : filter}`}
              </p>
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
                    <p className="text-gray-500">
                      Client: {reservation.customerInfo?.name}
                    </p>
                    <p className="text-sm text-gray-400">
                      {reservation.customerInfo?.email} - {reservation.customerInfo?.phone}
                    </p>
                  </div>
                  <div className="mt-4 md:mt-0 md:ml-8 text-right">
                    <p className="font-medium text-gray-900 dark:text-white">
                      {reservation.date?.toLocaleDateString('fr-FR')}
                    </p>
                    <p className="text-gray-500">
                      {reservation.startTime} - {reservation.endTime}
                    </p>
                    <p className="text-blue-600 font-bold mt-1">
                      {reservation.price} DT
                    </p>
                  </div>
                </div>
                
                {/* Actions */}
                {reservation.status === 'pending' && (
                  <div className="mt-4 flex space-x-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <button
                      onClick={() => updateStatus(reservation._id, 'confirmed')}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      Confirmer
                    </button>
                    <button
                      onClick={() => updateStatus(reservation._id, 'cancelled')}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    >
                      Refuser
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}