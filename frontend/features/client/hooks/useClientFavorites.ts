// features/client/hooks/useClientFavorites.ts

import { useState, useEffect, useCallback } from 'react';
import { favoritesApi } from '@/lib/api/users/favorites.api';
import { Service } from '@/types';

interface UseClientFavoritesReturn {
  favorites: Service[];
  loading: boolean;
  error: string | null;
  addFavorite: (serviceId: string) => Promise<void>;
  removeFavorite: (serviceId: string) => Promise<void>;
  isFavorite: (serviceId: string) => boolean;
}

export function useClientFavorites(): UseClientFavoritesReturn {
  const [favorites, setFavorites] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFavorites = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const services = await favoritesApi.getFavorites();
      setFavorites(services);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors du chargement des favoris');
    } finally {
      setLoading(false);
    }
  }, []);

  const addFavorite = useCallback(async (serviceId: string) => {
    await favoritesApi.add(serviceId);
    await fetchFavorites();
  }, [fetchFavorites]);

  const removeFavorite = useCallback(async (serviceId: string) => {
    await favoritesApi.remove(serviceId);
    setFavorites(prev => prev.filter(s => s._id !== serviceId));
  }, []);

  const isFavorite = useCallback((serviceId: string) => {
    return favorites.some(s => s._id === serviceId);
  }, [favorites]);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  return { favorites, loading, error, addFavorite, removeFavorite, isFavorite };
}