// features/admin/hooks/useAdminStats.ts

import { useState, useEffect, useCallback } from 'react';
import { adminApi, AdminStats } from '@/lib/api/admin';

interface UseAdminStatsReturn {
  stats: AdminStats | null;
  loading: boolean;
  error: string | null;
  fetchStats: (timeRange?: 'week' | 'month' | 'year') => Promise<void>;
}

export function useAdminStats(): UseAdminStatsReturn {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async (timeRange: 'week' | 'month' | 'year' = 'month') => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminApi.getStats(timeRange);
      setStats(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors du chargement des statistiques');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, loading, error, fetchStats };
}