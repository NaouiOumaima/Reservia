// app/admin/dashboard/page.tsx

'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Stats {
  totalUsers: number;
  totalServices: number;
  totalReservations: number;
  totalRevenue: number;
}

export default function AdminDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalServices: 0,
    totalReservations: 0,
    totalRevenue: 0,
  });

  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">Chargement...</div>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            Dashboard Administrateur
          </h1>
          
          <p className="text-gray-600 mb-8">
            Bienvenue, {user.firstName} {user.lastName} !
          </p>
          
          {/* Cartes statistiques */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-gray-500 text-sm font-medium">Utilisateurs</h3>
              <p className="text-3xl font-bold text-blue-600">{stats.totalUsers}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-gray-500 text-sm font-medium">Services</h3>
              <p className="text-3xl font-bold text-green-600">{stats.totalServices}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-gray-500 text-sm font-medium">Réservations</h3>
              <p className="text-3xl font-bold text-purple-600">{stats.totalReservations}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-gray-500 text-sm font-medium">Revenus</h3>
              <p className="text-3xl font-bold text-orange-600">{stats.totalRevenue} DT</p>
            </div>
          </div>

          {/* Menu d'administration */}
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Gestion</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link href="/admin/users" className="bg-white rounded-lg shadow p-4 hover:shadow-md transition">
              <div className="text-4xl mb-2">👥</div>
              <h3 className="font-semibold text-lg">Utilisateurs</h3>
              <p className="text-gray-500 text-sm">Gérer les comptes</p>
            </Link>
            <Link href="/admin/services" className="bg-white rounded-lg shadow p-4 hover:shadow-md transition">
              <div className="text-4xl mb-2">📦</div>
              <h3 className="font-semibold text-lg">Services</h3>
              <p className="text-gray-500 text-sm">Modérer les services</p>
            </Link>
            <Link href="/admin/reviews" className="bg-white rounded-lg shadow p-4 hover:shadow-md transition">
              <div className="text-4xl mb-2">⭐</div>
              <h3 className="font-semibold text-lg">Avis</h3>
              <p className="text-gray-500 text-sm">Modérer les avis</p>
            </Link>
            <Link href="/admin/statistics" className="bg-white rounded-lg shadow p-4 hover:shadow-md transition">
              <div className="text-4xl mb-2">📊</div>
              <h3 className="font-semibold text-lg">Statistiques</h3>
              <p className="text-gray-500 text-sm">Voir les stats globales</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}