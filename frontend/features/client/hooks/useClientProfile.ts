// features/client/hooks/useClientProfile.ts

import { useState, useEffect, useCallback } from 'react';
import { authApi } from '@/lib/api/client';
import { User, UserPreferences } from '@/types';

interface UseClientProfileReturn {
  user: User | null;
  loading: boolean;
  error: string | null;
  updateProfile: (data: Partial<User>) => Promise<void>;
  updatePreferences: (preferences: Partial<UserPreferences>) => Promise<void>;
  refreshUser: () => Promise<void>;
}

export function useClientProfile(): UseClientProfileReturn {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshUser = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await authApi.getMe();
      const userData = response.data;
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors du chargement du profil');
      // Try to get from localStorage
      const stored = localStorage.getItem('user');
      if (stored) {
        setUser(JSON.parse(stored));
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const updateProfile = useCallback(async (data: Partial<User>) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authApi.updateProfile(data);
      const updatedUser = response.data;
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la mise à jour du profil');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updatePreferences = useCallback(async (preferences: Partial<UserPreferences>) => {
    setLoading(true);
    setError(null);
    try {
      const updatedUser = { ...user, preferences: { ...user?.preferences, ...preferences } };
      await authApi.updateProfile({ preferences: updatedUser.preferences });
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la mise à jour des préférences');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  return { user, loading, error, updateProfile, updatePreferences, refreshUser };
}