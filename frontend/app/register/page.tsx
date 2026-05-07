'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/providers/AuthProvider';

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'client' as 'client' | 'provider',
    phone: '',
    businessName: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // ── Google OAuth redirect ────────────────────────────────────────────────────
  // Redirige vers le backend NestJS qui gère le flux OAuth Google complet
  const handleGoogleLogin = () => {
    // Valider pour provider: businessName obligatoire
    if (formData.role === 'provider' && !formData.businessName.trim()) {
      setError('Le nom de l\'établissement est obligatoire pour les fournisseurs');
      return;
    }

    // ✅ Stocker le rôle et businessName dans les cookies (persiste à travers OAuth)
    const expires = new Date(Date.now() + 10 * 60 * 1000).toUTCString(); // 10 min
    document.cookie = `oauth_role=${formData.role}; path=/; expires=${expires}; SameSite=Lax`;
    if (formData.businessName) {
      document.cookie = `oauth_businessName=${encodeURIComponent(formData.businessName)}; path=/; expires=${expires}; SameSite=Lax`;
    }

    const backendUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:3001';
    window.location.href = `${backendUrl}/api/auth/google`;
  };

  // ── Formulaire classique ────────────────────────────────────────────────────
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }
    if (formData.password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères');
      return;
    }

    setIsLoading(true);
    try {
      const { confirmPassword, ...registerData } = formData;
      await register(registerData);
      const storedUser = localStorage.getItem('user');
      const currentUser = storedUser ? JSON.parse(storedUser) : null;

      if (currentUser?.role === 'admin') {
        router.push('/admin/dashboard');
      } else if (currentUser?.role === 'provider') {
        router.push('/provider/dashboard');
      } else {
        router.push('/client/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Une erreur est survenue');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full card p-8">
        {/* ── En-tête ── */}
        <div className="text-center">
          <h2 className="text-primary font-display text-3xl">Inscription</h2>
          <p className="mt-2 text-sm text-muted">
            Ou{' '}
            <Link href="/login" className="text-primary hover:underline">
              connectez-vous à votre compte
            </Link>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {/* ── Erreur ── */}
          {error && (
            <div className="alert alert-error">
              <p className="text-sm">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            {/* Prénom / Nom */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="label">Prénom</label>
                <input
                  id="firstName" name="firstName" type="text" required
                  value={formData.firstName} onChange={handleChange} className="input"
                />
              </div>
              <div>
                <label htmlFor="lastName" className="label">Nom</label>
                <input
                  id="lastName" name="lastName" type="text" required
                  value={formData.lastName} onChange={handleChange} className="input"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="label">Email</label>
              <input
                id="email" name="email" type="email" autoComplete="email" required
                value={formData.email} onChange={handleChange} className="input"
              />
            </div>

            {/* Rôle */}
            <div>
              <label htmlFor="role" className="label">Type de compte</label>
              <select id="role" name="role" value={formData.role} onChange={handleChange} className="input">
                <option value="client">Client – Je veux réserver des services</option>
                <option value="provider">Fournisseur – Je propose des services</option>
              </select>
            </div>

            {/* Nom établissement (provider uniquement) */}
            {formData.role === 'provider' && (
              <div>
                <label htmlFor="businessName" className="label">Nom de l'établissement</label>
                <input
                  id="businessName" name="businessName" type="text" required
                  value={formData.businessName} onChange={handleChange} className="input"
                />
              </div>
            )}

            {/* Téléphone */}
            <div>
              <label htmlFor="phone" className="label">Téléphone (optionnel)</label>
              <input
                id="phone" name="phone" type="tel"
                value={formData.phone} onChange={handleChange} className="input"
              />
            </div>

            {/* Mot de passe */}
            <div>
              <label htmlFor="password" className="label">Mot de passe</label>
              <input
                id="password" name="password" type="password" required
                value={formData.password} onChange={handleChange} className="input"
              />
              <p className="text-xs text-muted mt-1">
                8 caractères minimum, dont 1 majuscule, 1 minuscule, 1 chiffre et 1 caractère spécial
              </p>
            </div>

            {/* Confirmer MDP */}
            <div>
              <label htmlFor="confirmPassword" className="label">Confirmer le mot de passe</label>
              <input
                id="confirmPassword" name="confirmPassword" type="password" required
                value={formData.confirmPassword} onChange={handleChange} className="input"
              />
            </div>
          </div>

          {/* ── Bouton S'inscrire ── */}
          <button type="submit" disabled={isLoading} className="btn btn-primary w-full py-3">
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="spinner w-4 h-4 border-2" />
                Inscription...
              </span>
            ) : (
              "S'inscrire"
            )}
          </button>

          {/* ── Séparateur ── */}
          <div className="relative my-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-3 text-muted">ou continuer avec</span>
            </div>
          </div>

          {/* ── Bouton Google ── */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={formData.role === 'provider' && !formData.businessName.trim()}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
          >
            {/* Logo Google SVG officiel */}
            <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            <span className="text-sm font-medium text-gray-700">Continuer avec Google</span>
          </button>
        </form>
      </div>
    </div>
  );
}