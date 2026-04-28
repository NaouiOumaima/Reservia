'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Service } from '@/types';
import { StarIcon } from '@/components/ui/Icons';
import { favoritesApi } from '@/lib/api/users/favorites.api';

export default function ClientFavoritesPage() {
  const [favorites, setFavorites] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const data = await favoritesApi.getFavorites();
        setFavorites(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchFavorites();
  }, []);

  const removeFavorite = async (serviceId: string) => {
    await favoritesApi.remove(serviceId);
    setFavorites(favorites.filter(s => s._id !== serviceId));
  };

  if (loading) return <div className="flex justify-center py-12"><div className="spinner" /></div>;

  return (
    <div className="min-h-screen bg-surface">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-2">Mes Favoris</h1>
        <p className="text-muted mb-6">Services que vous avez aimés</p>

        {favorites.length === 0 ? (
          <div className="card text-center py-12">
            <StarIcon className="w-16 h-16 text-muted mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Aucun favori</h3>
            <Link href="/search" className="btn btn-primary">Découvrir des services</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favorites.map(service => (
              <div key={service._id} className="card overflow-hidden p-0">
                <div className="h-40 bg-gray-200 relative">
                  {service.images?.[0] && <img src={service.images[0]} alt={service.name} className="w-full h-full object-cover" />}
                </div>
                <div className="p-4">
                  <div className="flex justify-between items-start">
                    <h3 className="font-semibold">{service.name}</h3>
                    <button onClick={() => removeFavorite(service._id)} className="text-error text-sm">Retirer</button>
                  </div>
                  <p className="text-sm text-muted">{service.location.city}</p>
                  <div className="flex justify-between items-center mt-3">
                    <span className="text-primary font-bold">{service.basePrice} DT</span>
                    <Link href={`/service/${service._id}`} className="btn btn-sm btn-primary">Détails</Link>
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