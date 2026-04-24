// features/admin/hooks/useAdminUsers.ts

import { useState, useEffect, useCallback } from 'react';
import { usersApi } from '@/lib/api/client';
import { User } from '@/types';

interface UseAdminUsersReturn {
  users: User[];
  stats: { total: number; clients: number; providers: number; admins: number };
  loading: boolean;
  error: string | null;
  fetchUsers: (role?: 'client' | 'provider' | 'admin') => Promise<void>;
  updateUserRole: (userId: string, role: string) => Promise<void>;
  banUser: (userId: string) => Promise<void>;
  unbanUser: (userId: string) => Promise<void>;
}

export function useAdminUsers(): UseAdminUsersReturn {
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState({ total: 0, clients: 0, providers: 0, admins: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async (role?: 'client' | 'provider' | 'admin') => {
    setLoading(true);
    setError(null);
    try {
      const response = await usersApi.getAll(role);
      setUsers(response.data || response);
      
      // Get stats
      const statsResponse = await usersApi.getStats();
      setStats(statsResponse.data || statsResponse);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors du chargement des utilisateurs');
    } finally {
      setLoading(false);
    }
  }, []);

  const updateUserRole = useCallback(async (userId: string, role: string) => {
    setLoading(true);
    setError(null);
    try {
      await usersApi.updateRole(userId, role);
      setUsers(prev => prev.map(u => u._id === userId ? { ...u, role: role as any } : u));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors du changement de rôle');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const banUser = useCallback(async (userId: string) => {
    setLoading(true);
    setError(null);
    try {
      await usersApi.banUser(userId);
      setUsers(prev => prev.map(u => u._id === userId ? { ...u, isBanned: true } : u));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors du bannissement');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const unbanUser = useCallback(async (userId: string) => {
    setLoading(true);
    setError(null);
    try {
      await usersApi.unbanUser(userId);
      setUsers(prev => prev.map(u => u._id === userId ? { ...u, isBanned: false } : u));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors du débannissement');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return { users, stats, loading, error, fetchUsers, updateUserRole, banUser, unbanUser };
}