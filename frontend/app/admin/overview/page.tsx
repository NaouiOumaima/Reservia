// app/admin/overview/page.tsx

'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function AdminOverviewPage() {
  const [stats, setStats] = useState({
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

  useEffect(() => {
    // Simulated data - replace with API call
    setStats({
      totalUsers: 1250,
      totalProviders: 180,
      totalClients: 1050,
      totalServices: 420,
      pendingServices: 12,
      totalReservations: 3450,
      activeUsers: 89,
      systemHealth: 'good',
    });
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">
            Supervision - Vue globale système
          </h1>
          <p className="text-gray-400 mt-1">
            Tableau de bord administrateur
          </p>
        </div>

        {/* System Health */}
        <div className={`rounded-lg p-6 mb-8 ${
          stats.systemHealth === 'good' ? 'bg-green-900/30 border border-green-700' : 'bg-red-900/30 border border-red-700'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className={`text-2xl ${stats.systemHealth === 'good' ? 'text-green-500' : 'text-red-500'}`}>
                {stats.systemHealth === 'good' ? '✓' : '⚠'}
              </span>
              <div>
                <h3 className="font-semibold text-white">
                  État du système: {stats.systemHealth === 'good' ? 'Opérationnel' : 'Problèmes détectés'}
                </h3>
                <p className="text-sm text-gray-400">
                  Dernière vérification: {new Date().toLocaleString('fr-FR')}
                </p>
              </div>
            </div>
            <Link
              href="/admin/logs"
              className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600"
            >
              Voir les logs
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-800 rounded-lg shadow-sm p-6">
            <p className="text-3xl font-bold text-white">{stats.totalUsers}</p>
            <p className="text-sm text-gray-400">Total utilisateurs</p>
          </div>
          <div className="bg-gray-800 rounded-lg shadow-sm p-6">
            <p className="text-3xl font-bold text-white">{stats.totalProviders}</p>
            <p className="text-sm text-gray-400">Fournisseurs</p>
          </div>
          <div className="bg-gray-800 rounded-lg shadow-sm p-6">
            <p className="text-3xl font-bold text-white">{stats.totalClients}</p>
            <p className="text-sm text-gray-400">Clients</p>
          </div>
          <div className="bg-gray-800 rounded-lg shadow-sm p-6">
            <p className="text-3xl font-bold text-white">{stats.activeUsers}</p>
            <p className="text-sm text-gray-400">Utilisateurs actifs</p>
          </div>
        </div>

        {/* Services & Reservations */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-800 rounded-lg shadow-sm p-6">
            <p className="text-3xl font-bold text-white">{stats.totalServices}</p>
            <p className="text-sm text-gray-400">Services totaux</p>
          </div>
          <div className="bg-gray-800 rounded-lg shadow-sm p-6">
            <p className="text-3xl font-bold text-yellow-500">{stats.pendingServices}</p>
            <p className="text-sm text-gray-400">Services en attente de validation</p>
            <Link href="/admin/pending-services" className="text-blue-400 text-sm hover:underline mt-2 block">
              Valider →
            </Link>
          </div>
          <div className="bg-gray-800 rounded-lg shadow-sm p-6">
            <p className="text-3xl font-bold text-white">{stats.totalReservations}</p>
            <p className="text-sm text-gray-400">Réservations totales</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-gray-800 rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-bold text-white mb-4">Actions rapides</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              href="/admin/users"
              className="p-4 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
            >
              <h3 className="font-semibold text-white">Gérer utilisateurs</h3>
              <p className="text-sm text-gray-400">Bannir, changer rôles</p>
            </Link>
            <Link
              href="/admin/pending-services"
              className="p-4 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
            >
              <h3 className="font-semibold text-white">Valider services</h3>
              <p className="text-sm text-gray-400">{stats.pendingServices} en attente</p>
            </Link>
            <Link
              href="/admin/reported-reviews"
              className="p-4 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
            >
              <h3 className="font-semibold text-white">Modérer avis</h3>
              <p className="text-sm text-gray-400">Avis signalés</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}