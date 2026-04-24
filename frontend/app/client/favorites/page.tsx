// app/client/favorites/page.tsx

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Service } from '@/types';

export default function ClientFavoritesPage() {
  const [favorites, setFavorites] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulated data - replace with API call
    setLoading(false);
  }, []);

  const removeFavorite = (serviceId: string) => {
    setFavorites(favorites.filter((f) => f._id !== serviceId));
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Mes Favoris
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            Services que vous avez aimés
          </p>
        </div>

        {/* Favorites Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : favorites.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-12 text-center">
            <div className="text-6xl mb-4">❤️</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Aucun favori
            </h3>
            <p className="text-gray-500 mb-6">
              Ajoutez des services à vos favoris pour les retrouver facilement
            </p>
            <Link
              href="/search"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
            >
              Découvrir des services
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favorites.map((service) => (
              <div
                key={service._id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden"
              >
                <div className="h-48 bg-gray-200 dark:bg-gray-700 relative">
                  {service.images?.[0] && (
                    <img
                      src={service.images[0]}
                      alt={service.name}
                      className="w-full h-full object-cover"
                    />
                  )}
                  <button
                    onClick={() => removeFavorite(service._id)}
                    className="absolute top-2 right-2 p-2 bg-white dark:bg-gray-800 rounded-full shadow-md"
                  >
                    ❤️
                  </button>
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-500">{service.category}</span>
                    <div className="flex items-center">
                      <span className="text-yellow-500">★</span>
                      <span className="ml-1 text-sm text-gray-600">
                        {service.rating.toFixed(1)}
                      </span>
                      <span className="ml-1 text-sm text-gray-400">
                        ({service.reviewCount})
                      </span>
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                    {service.name}
                  </h3>
                  <p className="text-sm text-gray-500 mb-2">
                    {service.location.city}, {service.location.governorate}
                  </p>
                  <div className="flex items-center justify-between">
                    <p className="text-blue-600 font-bold">
                      {service.price} DT
                    </p>
                    <Link
                      href={`/service/${service._id}`}
                      className="text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Voir →
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}