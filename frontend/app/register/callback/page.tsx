'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';
import { apiClient } from '@/lib/api/config';

function Spinner() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <svg className="animate-spin h-10 w-10 text-primary"
            xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10"
              stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor"
              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
          </svg>
        </div>
        <p className="text-muted text-sm">Connexion avec Google en cours...</p>
      </div>
    </div>
  );
}

function CallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refreshAuth } = useAuth();

  useEffect(() => {
    const handleCallback = async () => {
      const accessToken = searchParams.get('accessToken');
      const refreshToken = searchParams.get('refreshToken');
      const error = searchParams.get('error');

      if (error || !accessToken || !refreshToken) {
        router.push('/register?error=google_auth_failed');
        return;
      }

      // 1. localStorage
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);

      // 2. Cookie pour le middleware
      const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toUTCString();
      document.cookie = `accessToken=${accessToken}; path=/; expires=${expires}; SameSite=Lax`;

      try {
        // 3. Récupérer le profil
        const response = await apiClient.get('/auth/me', {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        // 4. Stocker le user
        localStorage.setItem('user', JSON.stringify(response.data));

        // 5. Sync state React
        refreshAuth();

        // 6. Vérifier si c'est un compte Google sans mot de passe
        const hasPassword = response.data?.password && response.data.password.length > 0;
        const isGoogleAccount = response.data?.googleId;

        if (isGoogleAccount && !hasPassword) {
          // Première connexion Google -> rediriger pour définir mot de passe
          router.replace('/auth/set-password');
          return;
        }

        // 7. Sinon, rediriger selon le rôle
        const role = response.data?.role;
        if (role === 'admin') {
          router.replace('/admin/dashboard');
        } else if (role === 'provider') {
          router.replace('/provider/dashboard');
        } else {
          router.replace('/client/dashboard');
        }
      } catch (err) {
        console.error('Failed to fetch user:', err);
        refreshAuth();
        router.replace('/client/dashboard');
      }
    };

    handleCallback();
  }, [searchParams, router, refreshAuth]);

  return <Spinner />;
}

export default function GoogleCallbackPage() {
  return (
    <Suspense fallback={<Spinner />}>
      <CallbackHandler />
    </Suspense>
  );
}