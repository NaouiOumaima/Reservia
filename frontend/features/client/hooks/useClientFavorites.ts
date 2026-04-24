// features/client/hooks/useClientFavorites.ts

import { useState, useEffect, useCallback } from 'react';
import { servicesApi } from '@/lib/api/client';
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
      // Get favorites from localStorage (in real app, use API)
      const stored = localStorage.getItem('favorites');
      const favoriteIds = stored ? JSON.parse(stored) : [];
      
      // Fetch service details
      const services = await Promise.all(
        favoriteIds.map((id: string) => servicesApi.getById(id).catch(() => null))
      );
      
      setFavorites(services.filter(Boolean));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors du chargement des favoris');
    } finally {
      setLoading(false);
    }
  }, []);

  const addFavorite = useCallback(async (serviceId: string) => {
    const stored = localStorage.getItem('favorites');
    const favoriteIds: string[] = stored ? JSON.parse(stored) : [];
    
    if (!favoriteIds.includes(serviceId)) {
      favoriteIds.push(serviceId);
      localStorage.setItem('favorites', JSON.stringify(favoriteIds));
      
      // Fetch and add the service
      const service = await servicesApi.getById(serviceId);
      setFavorites(prev => [...prev, service.data]);
    }
  }, []);

  const removeFavorite = useCallback(async (serviceId: string) => {
    const stored = localStorage.getItem('favorites');
    const favoriteIds: string[] = stored ? JSON.parse(stored) : [];
    
    const newFavorites = favoriteIds.filter((id: string) => id !== serviceId);
    localStorage.setItem('favorites', JSON.stringify(newFavorites));
    
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