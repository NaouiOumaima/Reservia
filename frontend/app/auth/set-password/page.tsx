'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';
import { apiClient } from '@/lib/api/config';

export default function SetPasswordPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Rediriger si utilisateur n'est pas connecté
  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  // Rediriger si l'utilisateur a déjà un mot de passe (pas un compte Google)
  useEffect(() => {
    // On peut vérifier depuis l'URL ou depuis une propriété utilisateur
    // Pour l'instant, on suppose que si user.googleId existe, c'est un compte Google
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation
    if (!password.trim()) {
      setError('Le mot de passe est obligatoire');
      return;
    }

    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    if (password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await apiClient.post('/auth/set-password', { password });
      setSuccess('✅ Mot de passe défini avec succès !');
      
      setTimeout(() => {
        if (user?.role === 'provider') {
          router.push('/provider/dashboard');
        } else {
          router.push('/client/dashboard');
        }
      }, 1500);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Une erreur est survenue');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = () => {
    if (user?.role === 'provider') {
      router.push('/provider/dashboard');
    } else {
      router.push('/client/dashboard');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full card p-8">
        <div className="text-center mb-8">
          <h1 className="text-primary font-display text-3xl">Sécuriser votre compte</h1>
          <p className="text-muted text-sm mt-2">
            Définissez un mot de passe pour pouvoir accéder à votre compte sans Google
          </p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="alert alert-error">
              <p className="text-sm">{error}</p>
            </div>
          )}

          {success && (
            <div className="alert alert-success">
              <p className="text-sm">{success}</p>
            </div>
          )}

          <div>
            <label htmlFor="password" className="label">
              Mot de passe
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input"
              placeholder="••••••••"
              disabled={isSubmitting}
              required
            />
            <p className="text-xs text-muted mt-1">
              8 caractères minimum
            </p>
          </div>

          <div>
            <label htmlFor="confirmPassword" className="label">
              Confirmer le mot de passe
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="input"
              placeholder="••••••••"
              disabled={isSubmitting}
              required
            />
          </div>

          <div className="space-y-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary w-full py-3"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="spinner w-4 h-4 border-2"></span>
                  Définition...
                </span>
              ) : (
                'Définir mon mot de passe'
              )}
            </button>

            <button
              type="button"
              onClick={handleSkip}
              disabled={isSubmitting}
              className="btn btn-ghost w-full py-3"
            >
              Passer pour maintenant
            </button>
          </div>
        </form>

        <p className="text-xs text-muted text-center mt-6">
          Vous pourrez ajouter un mot de passe plus tard dans vos paramètres de sécurité.
        </p>
      </div>
    </div>
  );
}
