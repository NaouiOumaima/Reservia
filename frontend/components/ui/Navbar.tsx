'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import ThemeToggle from './ThemeToggle';
import Logo from './Logo';
import { User } from '@/types';

interface NavbarProps {
  user?: User | null;
}

export default function Navbar({ user: propUser }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (propUser) {
      setUser(propUser);
    } else if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('user');
      if (stored) {
        try { setUser(JSON.parse(stored)); } catch { setUser(null); }
      }
    }
  }, [propUser]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false);
      if (notificationsRef.current && !notificationsRef.current.contains(e.target as Node)) setNotificationsOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    router.push('/login');
  };

  // Icônes SVG
  const BellIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </svg>
  );

  const BurgerIcon = ({ open }: { open: boolean }) => (
    <svg className="navbar-burger-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      {open ? (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      ) : (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
      )}
    </svg>
  );

  const SearchIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  );

  const MapIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
    </svg>
  );

  // ============================================
  // VISITEUR
  // ============================================
  if (!user) {
    return (
      <>
        <div className="navbar-wrapper">
          <div className="navbar-container">
            <div className="navbar-flex">
              {/* Logo */}
              <div className="navbar-logo-group">
                <Logo href="/" size="md" variant="default" animated />
              </div>

              {/* Liens desktop */}
              <div className="navbar-links">
                <Link href="/" className={`navbar-link ${pathname === '/' ? 'navbar-link-active' : ''}`}>Accueil</Link>
                <Link href="/search" className={`navbar-link ${pathname === '/search' ? 'navbar-link-active' : ''}`}>Explorer</Link>
                <Link href="/about" className={`navbar-link ${pathname === '/about' ? 'navbar-link-active' : ''}`}>À propos</Link>
              </div>

              {/* Actions */}
              <div className="navbar-actions">
                <div className="navbar-desktop-actions">
                  <ThemeToggle />
                  <Link href="/login" className="btn btn-ghost btn-sm">Se connecter</Link>
                  <Link href="/register" className="btn btn-primary btn-sm">S'inscrire</Link>
                </div>
                <div className="navbar-mobile-actions">
                  <ThemeToggle />
                  <button onClick={() => setIsOpen(!isOpen)} className="navbar-icon-btn">
                    <BurgerIcon open={isOpen} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {isOpen && (
          <div className="navbar-mobile-menu">
            <div className="navbar-mobile-links">
              <Link href="/" onClick={() => setIsOpen(false)} className="navbar-mobile-link">Accueil</Link>
              <Link href="/search" onClick={() => setIsOpen(false)} className="navbar-mobile-link">Explorer</Link>
              <Link href="/about" onClick={() => setIsOpen(false)} className="navbar-mobile-link">À propos</Link>
              <Link href="/login" onClick={() => setIsOpen(false)} className="navbar-mobile-link">Se connecter</Link>
              <Link href="/register" onClick={() => setIsOpen(false)} className="navbar-mobile-link">S'inscrire</Link>
            </div>
          </div>
        )}
      </>
    );
  }

  // ============================================
  // CLIENT
  // ============================================
  if (user.role === 'client') {
    const clientLinks = [
      { href: '/client/profile', label: 'Mon profil' },
      { href: '/client/preferences', label: 'Préférences' },
      { href: '/client/reservations', label: 'Historique réservations' },
      { href: '/client/reviews', label: 'Mes avis postés' },
      { href: '/help', label: 'Aide / Tutoriel carte' },
    ];

    return (
      <>
        <div className="navbar-wrapper">
          <div className="navbar-container">
            <div className="navbar-flex">
              <div className="navbar-logo-group">
                <Logo href="/client/dashboard" size="md" variant="default" animated />
              </div>

              <div className="navbar-links">
                <Link href="/search" className={`navbar-link ${pathname === '/search' ? 'navbar-link-active' : ''}`}>
                  <SearchIcon /> Recherche
                </Link>
               <Link href="/client/carte" className={`navbar-link ${pathname === '/client/carte' ? 'navbar-link-active' : ''}`}>
    <MapIcon /> Carte
  </Link>
                <Link href="/client/bookings" className={`navbar-link ${pathname === '/client/bookings' ? 'navbar-link-active' : ''}`}>
                  Mes réservations
                </Link>
                <Link href="/client/favorites" className={`navbar-link ${pathname === '/client/favorites' ? 'navbar-link-active' : ''}`}>
                  Favoris
                </Link>
              </div>

              <div className="navbar-actions">
                <div className="relative" ref={notificationsRef}>
                  <button onClick={() => setNotificationsOpen(!notificationsOpen)} className="navbar-icon-btn">
                    <BellIcon />
                    <span className="navbar-notif-dot"></span>
                  </button>
                  {notificationsOpen && (
                    <div className="navbar-dropdown">
                      <div className="navbar-dropdown-header"><h3 className="navbar-dropdown-title">Notifications</h3></div>
                      <div className="navbar-dropdown-empty">Aucune nouvelle notification</div>
                      <Link href="/client/notifications" className="navbar-dropdown-link">Voir toutes</Link>
                    </div>
                  )}
                </div>

                <ThemeToggle />

                <div className="relative" ref={profileRef}>
                  <button onClick={() => setProfileOpen(!profileOpen)} className="navbar-avatar-btn">
                    <div className="navbar-avatar">{user.firstName?.[0]}{user.lastName?.[0]}</div>
                  </button>
                  {profileOpen && (
                    <div className="navbar-dropdown navbar-dropdown-sm">
                      <div className="navbar-dropdown-header">
                        <p className="font-semibold text-sm">{user.firstName} {user.lastName}</p>
                        <p className="navbar-dropdown-text">{user.email}</p>
                      </div>
                      <div>
                        {clientLinks.map((link) => (
                          <Link key={link.href} href={link.href} className="navbar-profile-item">{link.label}</Link>
                        ))}
                      </div>
                      <div className="border-t border-[rgb(var(--border))] py-1">
                        <button onClick={handleLogout} className="navbar-profile-logout">Déconnexion</button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="navbar-mobile-actions">
                  <button onClick={() => setIsOpen(!isOpen)} className="navbar-icon-btn">
                    <BurgerIcon open={isOpen} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {isOpen && (
  <div className="navbar-mobile-menu">
    <div className="navbar-mobile-links">
      <Link href="/search" onClick={() => setIsOpen(false)} className="navbar-mobile-link">Recherche</Link>
      {/* ❌ CORRIGER ICI : remplacer /map par /client/carte */}
      <Link href="/client/carte" onClick={() => setIsOpen(false)} className="navbar-mobile-link">Carte</Link>
      <Link href="/client/bookings" onClick={() => setIsOpen(false)} className="navbar-mobile-link">Mes réservations</Link>
      <Link href="/client/favorites" onClick={() => setIsOpen(false)} className="navbar-mobile-link">Favoris</Link>
      <Link href="/client/profile" onClick={() => setIsOpen(false)} className="navbar-mobile-link">Mon profil</Link>
      <button onClick={handleLogout} className="navbar-mobile-logout">Déconnexion</button>
    </div>
  </div>
)}
      </>
    );
  }

  // ============================================
// PROVIDER
// ============================================
if (user.role === 'provider') {
  const providerLinks = [
    { href: '/provider/dashboard', label: 'Tableau de bord' },
    { href: '/provider/services', label: 'Mes services' },
    { href: '/provider/location', label: 'Localisation' },
    { href: '/provider/availability', label: 'Disponibilités' },
    { href: '/provider/bookings', label: 'Réservations' },
    { href: '/provider/reviews', label: 'Avis & notes' },
  ];

  return (
    <>
      <div className="navbar-wrapper">
        <div className="navbar-container">
          <div className="navbar-flex">
            <div className="navbar-logo-group">
              <Logo href="/provider/dashboard" size="md" variant="default" animated />
            </div>

            <div className="navbar-links">
              {providerLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`navbar-link ${pathname === link.href ? 'navbar-link-active' : ''}`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <div className="navbar-actions">
              {/* Notifications */}
              <div className="relative" ref={notificationsRef}>
                <button onClick={() => setNotificationsOpen(!notificationsOpen)} className="navbar-icon-btn">
                  <BellIcon />
                  <span className="navbar-notif-dot"></span>
                </button>
                {notificationsOpen && (
                  <div className="navbar-dropdown">
                    <div className="navbar-dropdown-header"><h3 className="navbar-dropdown-title">Notifications</h3></div>
                    <div className="navbar-dropdown-empty">Aucune nouvelle notification</div>
                    <Link href="/provider/notifications" className="navbar-dropdown-link">Voir toutes</Link>
                  </div>
                )}
              </div>

              <ThemeToggle />

              {/* Profil */}
              <div className="relative" ref={profileRef}>
                <button onClick={() => setProfileOpen(!profileOpen)} className="navbar-avatar-btn">
                  <div className="navbar-avatar navbar-avatar-green">
                    {user.firstName?.[0]}{user.lastName?.[0]}
                  </div>
                </button>
                {profileOpen && (
                  <div className="navbar-dropdown navbar-dropdown-sm">
                    <div className="navbar-dropdown-header">
                      <p className="font-semibold text-sm">{user.firstName} {user.lastName}</p>
                      <p className="navbar-dropdown-text">Fournisseur</p>
                    </div>
                    <div>
                      <Link href="/provider/dashboard" className="navbar-profile-item">Tableau de bord</Link>
                      <Link href="/provider/services" className="navbar-profile-item">Mes services</Link>
                      <Link href="/provider/location" className="navbar-profile-item">Localisation</Link>
                      <Link href="/provider/availability" className="navbar-profile-item">Disponibilités</Link>
                      <Link href="/provider/bookings" className="navbar-profile-item">Réservations</Link>
                      <Link href="/provider/reviews" className="navbar-profile-item">Avis & notes</Link>
                      <Link href="/provider/settings" className="navbar-profile-item">Paramètres</Link>
                    </div>
                    <div className="border-t border-[rgb(var(--border))] py-1">
                      <button onClick={handleLogout} className="navbar-profile-logout">Déconnexion</button>
                    </div>
                  </div>
                )}
              </div>

              {/* Menu burger mobile */}
              <div className="navbar-mobile-actions">
                <button onClick={() => setIsOpen(!isOpen)} className="navbar-icon-btn">
                  <BurgerIcon open={isOpen} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Menu mobile */}
      {isOpen && (
        <div className="navbar-mobile-menu">
          <div className="navbar-mobile-links">
            {providerLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="navbar-mobile-link"
              >
                {link.label}
              </Link>
            ))}
            <button onClick={handleLogout} className="navbar-mobile-logout">Déconnexion</button>
          </div>
        </div>
      )}
    </>
  );
}
  // ============================================
  // ADMIN
  // ============================================
  if (user.role === 'admin') {
    const adminLinks = [{ href: '/admin/profile', label: 'Profil admin' }];

    return (
      <>
        <div className="navbar-wrapper">
          <div className="navbar-container">
            <div className="navbar-flex">
              <div className="navbar-logo-group">
                <Logo href="/admin/dashboard" size="md" variant="default" animated />
                <span className="navbar-admin-badge">ADMIN</span>
              </div>

              <div className="navbar-links">
                <Link href="/admin/overview" className={`navbar-link navbar-link-dark ${pathname === '/admin/overview' ? 'navbar-link-active-dark' : ''}`}>Supervision</Link>
                <Link href="/admin/users" className={`navbar-link navbar-link-dark ${pathname === '/admin/users' ? 'navbar-link-active-dark' : ''}`}>Utilisateurs</Link>
                <Link href="/admin/pending-services" className={`navbar-link navbar-link-dark ${pathname === '/admin/pending-services' ? 'navbar-link-active-dark' : ''}`}>Services à valider</Link>
                <Link href="/admin/reported-reviews" className={`navbar-link navbar-link-dark ${pathname === '/admin/reported-reviews' ? 'navbar-link-active-dark' : ''}`}>Avis signalés</Link>
                <Link href="/admin/logs" className={`navbar-link navbar-link-dark ${pathname === '/admin/logs' ? 'navbar-link-active-dark' : ''}`}>Logs</Link>
                <Link href="/admin/alerts" className={`navbar-link navbar-link-dark ${pathname === '/admin/alerts' ? 'navbar-link-active-dark' : ''}`}>Alertes</Link>
              </div>

              <div className="navbar-actions">
                <div className="relative" ref={notificationsRef}>
                  <button onClick={() => setNotificationsOpen(!notificationsOpen)} className="navbar-icon-btn navbar-icon-btn-dark">
                    <BellIcon />
                    <span className="navbar-notif-dot"></span>
                  </button>
                  {notificationsOpen && (
                    <div className="navbar-dropdown bg-gray-800 border-gray-700">
                      <div className="navbar-dropdown-header border-gray-700"><h3 className="navbar-dropdown-title text-white">Alertes système</h3></div>
                      <div className="navbar-dropdown-empty text-gray-400">Aucune alerte</div>
                      <Link href="/admin/alerts" className="navbar-dropdown-link text-gray-300 hover:bg-gray-700 hover:text-blue-400">Voir toutes</Link>
                    </div>
                  )}
                </div>

                <ThemeToggle />

                <div className="relative" ref={profileRef}>
                  <button onClick={() => setProfileOpen(!profileOpen)} className="navbar-avatar-btn">
                    <div className="navbar-avatar navbar-avatar-red">{user.firstName?.[0]}{user.lastName?.[0]}</div>
                  </button>
                  {profileOpen && (
                    <div className="navbar-dropdown navbar-dropdown-sm bg-gray-800 border-gray-700">
                      <div className="navbar-dropdown-header border-gray-700">
                        <p className="font-semibold text-sm text-white">{user.firstName} {user.lastName}</p>
                        <p className="navbar-dropdown-text text-gray-400">Administrateur</p>
                      </div>
                      <div>
                        {adminLinks.map((link) => (
                          <Link key={link.href} href={link.href} className="navbar-profile-item text-gray-300 hover:bg-gray-700">{link.label}</Link>
                        ))}
                      </div>
                      <div className="border-t border-gray-700 py-1">
                        <button onClick={handleLogout} className="navbar-profile-logout text-red-400 hover:bg-gray-700">Déconnexion</button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return null;
}