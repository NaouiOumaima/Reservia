// features/admin/hooks/useAdminStats.ts

import { useState, useEffect, useCallback } from 'react';
import { dashboardApi } from '@/lib/api/client';

interface AdminStats {
  totalUsers: number;
  totalProviders: number;
  totalClients: number;
  totalServices: number;
  pendingServices: number;
  totalReservations: number;
  activeUsers: number;
  systemHealth: 'good' | 'warning' | 'critical';
}

interface UseAdminStatsReturn {
  stats: AdminStats;
  loading: boolean;
  error: string | null;
  fetchStats: () => Promise<void>;
}

export function useAdminStats(): UseAdminStatsReturn {
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalProviders: 0,
    totalClients: 0,
    totalServices: 0,
    pendingServices: 0,
    totalReservations: 0,
    activeUsers: 0,
    systemHealth: 'good',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await dashboardApi.getAdminStats();
      const data = response.data || response;
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