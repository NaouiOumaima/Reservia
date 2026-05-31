'use client';

// frontend/src/features/favorites/hooks/useFavorite.ts
import { useState, useEffect, useCallback } from 'react';
import { favoritesApi } from '@/lib/api/users/favorites.api';

/**
 * Gère l'état favori d'un service avec toggle optimiste.
 *
 * Usage :
 *   const { isFavorite, toggle, loading } = useFavorite(service._id);
 */
export function useFavorite(serviceId: string) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!serviceId) return;
    let cancelled = false;

    favoritesApi.isFavorite(serviceId).then((val) => {
      if (!cancelled) {
        setIsFavorite(val);
        setLoading(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [serviceId]);

  /**
   * Toggle optimiste : met à jour l'UI immédiatement,
   * rollback si l'API échoue.
   */
  const toggle = useCallback(
    async (e?: React.MouseEvent) => {
      e?.preventDefault();
      e?.stopPropagation();

      const prev = isFavorite;
      setIsFavorite(!prev); // optimiste

      try {
        if (prev) {
          await favoritesApi.remove(serviceId);
        } else {
          await favoritesApi.add(serviceId);
        }
      } catch (error) {
        console.error('Erreur toggle favori:', error);
        setIsFavorite(prev); // rollback
      }
    },
    [serviceId, isFavorite],
  );

  return { isFavorite, toggle, loading };
}