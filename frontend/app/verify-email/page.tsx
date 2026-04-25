// frontend/app/verify-email/page.tsx

'use client';

import { useEffect, useState, Suspense, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Logo from '@/components/ui/Logo';

type State = 'loading' | 'success' | 'error';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [state, setState] = useState<State>('loading');
  const [role, setRole] = useState<string>('client');
  const [errorMsg, setErrorMsg] = useState('');
  const hasVerified = useRef(false); // ← EMPÊCHE LES DOUBLES APPELS

  useEffect(() => {
    const token = searchParams.get('token');
    const email = searchParams.get('email');

    if (!token || !email) {
      setState('error');
      setErrorMsg('Lien de vérification invalide.');
      return;
    }

    // ✅ EMPÊCHE LE DOUBLE APPEL DÛ AU STRICT MODE
    if (hasVerified.current) {
      console.log('⏭️ Déjà vérifié, on ignore le second appel');
      return;
    }
    hasVerified.current = true;

    console.log('🔍 Vérification en cours...');

    fetch(`http://localhost:3001/api/auth/verify-email?token=${token}&email=${encodeURIComponent(email)}`)
      .then(async (res) => {
        const data = await res.json();
        console.log('📧 Status:', res.status);
        console.log('📧 Data:', data);
        return { status: res.status, data };
      })
      .then(({ status, data }) => {
        // ✅ Succès pour 200 OU si le message indique déjà vérifié
        if (status === 200 && data.success) {
          setState('success');
          setRole(data.role || 'client');
          if (data.accessToken) {
            localStorage.setItem('accessToken', data.accessToken);
            localStorage.setItem('refreshToken', data.refreshToken);
          }
        } else if (data.message === 'Email déjà vérifié') {
          // ✅ Cas du double appel - déjà vérifié
          setState('success');
          setRole(data.role || 'client');
        } else {
          setState('error');
          setErrorMsg(data.message || 'Lien invalide ou expiré.');
        }
      })
      .catch((error) => {
        console.error('Fetch error:', error);
        setState('error');
        setErrorMsg('Erreur de connexion au serveur.');
      });
  }, [searchParams]);

  const handleResend = async () => {
    const email = searchParams.get('email');
    if (!email) return;
    try {
      const response = await fetch('http://localhost:3001/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (response.ok) {
        alert('Email renvoyé ! Vérifiez votre boîte.');
        hasVerified.current = false; // Reset pour le nouveau lien
      } else {
        alert(data.message || 'Erreur lors de l\'envoi.');
      }
    } catch {
      alert('Erreur lors de l\'envoi.');
    }
  };

  return (
    <div className="verify-email-page">
      <div className="verify-email-logo">
        <Logo size="lg" variant="default" href="/" animated={true} />
      </div>

      <div className="verify-email-card">
        {state === 'loading' && (
          <>
            <div className="verify-email-icon verify-email-icon-loading">
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                <circle cx="16" cy="16" r="12" stroke="rgba(var(--foreground),0.15)" strokeWidth="3"/>
                <path d="M16 4a12 12 0 0 1 12 12" stroke="rgb(var(--primary))" strokeWidth="3" strokeLinecap="round"/>
              </svg>
            </div>
            <h1 className="verify-email-title">Vérification en cours…</h1>
            <p className="verify-email-text">Nous confirmons votre email, patientez un instant.</p>
          </>
        )}

        {state === 'success' && (
          <>
            <div className="verify-email-icon verify-email-icon-success">
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                <path d="M7 16l6 6 12-12" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h1 className="verify-email-title">Email confirmé !</h1>
            <p className="verify-email-text">
              {role === 'provider'
                ? 'Votre compte prestataire est actif. Vous pouvez commencer à publier vos services.'
                : 'Votre compte est actif. Vous pouvez commencer à réserver des services.'}
            </p>
            <div className="verify-email-role-badge">
              {role === 'provider' ? '🏢 Compte prestataire' : '👤 Compte client'}
            </div>
            <button onClick={() => router.push('/login')} className="verify-email-btn">
              Se connecter →
            </button>
          </>
        )}

        {state === 'error' && (
          <>
            <div className="verify-email-icon verify-email-icon-error">
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                <path d="M10 10l12 12M22 10l-12 12" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round"/>
              </svg>
            </div>
            <h1 className="verify-email-title">Lien invalide</h1>
            <p className="verify-email-text">{errorMsg}</p>
            <button onClick={handleResend} className="verify-email-btn-outline">
              Renvoyer un email de vérification
            </button>
            <button onClick={() => router.push('/')} className="verify-email-btn-link">
              ← Retour à l'accueil
            </button>
          </>
        )}
      </div>

      <p className="verify-email-footer">© 2025 Reservia — Tous droits réservés</p>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="verify-email-suspense"><p>Chargement...</p></div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}