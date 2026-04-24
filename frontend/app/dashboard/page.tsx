'use client';

import { useAuth } from '@/providers/AuthProvider';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function DashboardPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">Chargement...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
        Bonjour, {user.firstName} {user.lastName}
      </h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Role-specific dashboard content */}
        {user.role === 'client' && (
          <>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Mes réservations</h2>
              <p className="text-gray-600 dark:text-gray-400">Aucune réservation en cours</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Mes favoris</h2>
              <p className="text-gray-600 dark:text-gray-400">Aucun service favori</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Recommandations</h2>
              <p className="text-gray-600 dark:text-gray-400">Découvrez des services près de chez vous</p>
            </div>
          </>
        )}

        {user.role === 'provider' && (
          <>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Réservations du jour</h2>
              <p className="text-3xl font-bold text-blue-600">0</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Chiffre d'affaires</h2>
              <p className="text-3xl font-bold text-green-600">0€</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Note moyenne</h2>
              <p className="text-3xl font-bold text-yellow-600">0.0 ⭐</p>
            </div>
          </>
        )}

        {user.role === 'admin' && (
          <>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Utilisateurs</h2>
              <p className="text-3xl font-bold text-blue-600">-</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Services</h2>
              <p className="text-3xl font-bold text-green-600">-</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Réservations</h2>
              <p className="text-3xl font-bold text-purple-600">-</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}