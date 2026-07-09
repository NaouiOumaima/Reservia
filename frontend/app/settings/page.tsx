'use client';

import Link from 'next/link';
import { useAuth } from '@/providers/AuthProvider';
import { useTheme } from '@/hooks/useTheme';

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme, mounted } = useTheme();

  return (
    <div className="min-h-screen bg-surface">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-2">Paramètres</h1>
        <p className="text-muted mb-6">Gérez vos préférences de compte</p>

        <div className="card mb-4">
          <h3 className="text-lg font-semibold mb-2">Apparence</h3>
          <div className="flex items-center justify-between">
            <span className="text-muted">Thème {mounted && theme === 'dark' ? 'sombre' : 'clair'}</span>
            <button onClick={toggleTheme} className="btn btn-ghost" disabled={!mounted}>
              Basculer le thème
            </button>
          </div>
        </div>

        <div className="card mb-4">
          <h3 className="text-lg font-semibold mb-2">Compte</h3>
          <p className="text-muted mb-4">{user?.email}</p>
          <Link href="/profile" className="btn btn-ghost">
            Modifier mon profil
          </Link>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold mb-2">Session</h3>
          <button onClick={() => logout()} className="btn btn-primary">
            Se déconnecter
          </button>
        </div>
      </div>
    </div>
  );
}
