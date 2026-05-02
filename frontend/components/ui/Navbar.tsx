'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import ThemeToggle from './ThemeToggle';
import { useAuth } from '@/providers/AuthProvider';
import Logo from './Logo';
import { User } from '@/types';
import {
  BellIcon,
  BurgerIcon,
  MapIcon,
  SearchIcon,
  HomeIcon,
  CompassIcon,
  InfoIcon,
  HeartIcon,
  BookingIcon,
  GridIcon,
  LocationIcon,
  ClockIcon,
  ReviewIcon,
  ServicesIcon,
  MonitorIcon,
  UsersIcon,
  CheckIcon,
  FlagIcon,
  FileTextIcon,
  AlertTriangleIcon,
} from './Icons';

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
 const { user, logout } = useAuth();
 
 
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node))
        setProfileOpen(false);
      if (
        notificationsRef.current &&
        !notificationsRef.current.contains(e.target as Node)
      )
        setNotificationsOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

 const handleLogout = async () => {
  await logout();
  router.push('/login');
};
  // ============================================
  // VISITEUR
  // ============================================
  if (!user) {
    return (
      <>
        <div className="navbar-wrapper">
          <div className="navbar-container">
            <div className="navbar-flex">
              <div className="navbar-logo-group">
                <Logo href="/" size="md" variant="default" animated />
              </div>

              <div className="navbar-links">
                <Link
                  href="/"
                  className={`navbar-link ${pathname === '/' ? 'navbar-link-active' : ''}`}
                >
                  <HomeIcon className="w-4 h-4" /> Accueil
                </Link>
                <Link
                  href="/search"
                  className={`navbar-link ${pathname === '/search' ? 'navbar-link-active' : ''}`}
                >
                  <CompassIcon className="w-4 h-4" /> Explorer
                </Link>
                <Link
                  href="/about"
                  className={`navbar-link ${pathname === '/about' ? 'navbar-link-active' : ''}`}
                >
                  <InfoIcon className="w-4 h-4" /> À propos
                </Link>
              </div>

              <div className="navbar-actions">
                <div className="navbar-desktop-actions">
                  <ThemeToggle />
                  <Link href="/login" className="btn btn-ghost btn-sm">
                    Se connecter
                  </Link>
                  <Link href="/register" className="btn btn-primary btn-sm">
                    S'inscrire
                  </Link>
                </div>
                <div className="navbar-mobile-actions">
                  <ThemeToggle />
                  <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="navbar-icon-btn"
                  >
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
              <Link
                href="/"
                onClick={() => setIsOpen(false)}
                className="navbar-mobile-link"
              >
                <HomeIcon className="w-4 h-4" /> Accueil
              </Link>
              <Link
                href="/search"
                onClick={() => setIsOpen(false)}
                className="navbar-mobile-link"
              >
                <CompassIcon className="w-4 h-4" /> Explorer
              </Link>
              <Link
                href="/about"
                onClick={() => setIsOpen(false)}
                className="navbar-mobile-link"
              >
                <InfoIcon className="w-4 h-4" /> À propos
              </Link>
              <Link
                href="/login"
                onClick={() => setIsOpen(false)}
                className="navbar-mobile-link"
              >
                Se connecter
              </Link>
              <Link
                href="/register"
                onClick={() => setIsOpen(false)}
                className="navbar-mobile-link"
              >
                S'inscrire
              </Link>
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
                <Logo
                  href="/client/dashboard"
                  size="md"
                  variant="default"
                  animated
                />
              </div>

              <div className="navbar-links">
                <Link
                  href="/search"
                  className={`navbar-link ${pathname === '/search' ? 'navbar-link-active' : ''}`}
                >
                  <SearchIcon className="w-4 h-4" /> Recherche
                </Link>
                <Link
                  href="/client/carte"
                  className={`navbar-link ${pathname === '/client/carte' ? 'navbar-link-active' : ''}`}
                >
                  <MapIcon className="w-4 h-4" /> Carte
                </Link>
                <Link
                  href="/client/bookings"
                  className={`navbar-link ${pathname === '/client/bookings' ? 'navbar-link-active' : ''}`}
                >
                  <BookingIcon className="w-4 h-4" /> Mes réservations
                </Link>
                <Link
                  href="/client/favorites"
                  className={`navbar-link ${pathname === '/client/favorites' ? 'navbar-link-active' : ''}`}
                >
                  <HeartIcon className="w-4 h-4" /> Favoris
                </Link>
              </div>

              <div className="navbar-actions">
                <div className="relative" ref={notificationsRef}>
                  <button
                    onClick={() => setNotificationsOpen(!notificationsOpen)}
                    className="navbar-icon-btn"
                  >
                    <BellIcon />
                    <span className="navbar-notif-dot"></span>
                  </button>
                  {notificationsOpen && (
                    <div className="navbar-dropdown">
                      <div className="navbar-dropdown-header">
                        <h3 className="navbar-dropdown-title">Notifications</h3>
                      </div>
                      <div className="navbar-dropdown-empty">
                        Aucune nouvelle notification
                      </div>
                      <Link
                        href="/client/notifications"
                        className="navbar-dropdown-link"
                      >
                        Voir toutes
                      </Link>
                    </div>
                  )}
                </div>

                <ThemeToggle />

                <div className="relative" ref={profileRef}>
                  <button
                    onClick={() => setProfileOpen(!profileOpen)}
                    className="navbar-avatar-btn"
                  >
                    <div className="navbar-avatar">
                      {user.firstName?.[0]}
                      {user.lastName?.[0]}
                    </div>
                  </button>
                  {profileOpen && (
                    <div className="navbar-dropdown navbar-dropdown-sm">
                      <div className="navbar-dropdown-header">
                        <p className="font-semibold text-sm">
                          {user.firstName} {user.lastName}
                        </p>
                        <p className="navbar-dropdown-text">{user.email}</p>
                      </div>
                      <div>
                        {clientLinks.map((link) => (
                          <Link
                            key={link.href}
                            href={link.href}
                            className="navbar-profile-item"
                          >
                            {link.label}
                          </Link>
                        ))}
                      </div>
                      <div className="border-t border-[rgb(var(--border))] py-1">
                        <button
                          onClick={handleLogout}
                          className="navbar-profile-logout"
                        >
                          Déconnexion
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="navbar-mobile-actions">
                  <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="navbar-icon-btn"
                  >
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
              <Link
                href="/search"
                onClick={() => setIsOpen(false)}
                className="navbar-mobile-link"
              >
                <SearchIcon className="w-4 h-4" /> Recherche
              </Link>
              <Link
                href="/client/carte"
                onClick={() => setIsOpen(false)}
                className="navbar-mobile-link"
              >
                <MapIcon className="w-4 h-4" /> Carte
              </Link>
              <Link
                href="/client/bookings"
                onClick={() => setIsOpen(false)}
                className="navbar-mobile-link"
              >
                <BookingIcon className="w-4 h-4" /> Mes réservations
              </Link>
              <Link
                href="/client/favorites"
                onClick={() => setIsOpen(false)}
                className="navbar-mobile-link"
              >
                <HeartIcon className="w-4 h-4" /> Favoris
              </Link>
              <Link
                href="/client/profile"
                onClick={() => setIsOpen(false)}
                className="navbar-mobile-link"
              >
                Mon profil
              </Link>
              <button onClick={handleLogout} className="navbar-mobile-logout">
                Déconnexion
              </button>
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
      {
        href: '/provider/dashboard',
        label: 'Tableau de bord',
        icon: <GridIcon className="w-4 h-4" />,
      },
      {
        href: '/provider/services',
        label: 'Mes services',
        icon: <ServicesIcon className="w-4 h-4" />,
      },
      {
        href: '/provider/location',
        label: 'Localisation',
        icon: <LocationIcon className="w-4 h-4" />,
      },
      {
        href: '/provider/availability',
        label: 'Disponibilités',
        icon: <ClockIcon className="w-4 h-4" />,
      },
      {
        href: '/provider/bookings',
        label: 'Réservations',
        icon: <BookingIcon className="w-4 h-4" />,
      },
      {
        href: '/provider/reviews',
        label: 'Avis & notes',
        icon: <ReviewIcon className="w-4 h-4" />,
      },
    ];

    return (
      <>
        <div className="navbar-wrapper">
          <div className="navbar-container">
            <div className="navbar-flex">
              <div className="navbar-logo-group">
                <Logo
                  href="/provider/dashboard"
                  size="md"
                  variant="default"
                  animated
                />
              </div>

              <div className="navbar-links">
                {providerLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`navbar-link ${pathname === link.href ? 'navbar-link-active' : ''}`}
                  >
                    {link.icon} {link.label}
                  </Link>
                ))}
              </div>

              <div className="navbar-actions">
                <div className="relative" ref={notificationsRef}>
                  <button
                    onClick={() => setNotificationsOpen(!notificationsOpen)}
                    className="navbar-icon-btn"
                  >
                    <BellIcon />
                    <span className="navbar-notif-dot"></span>
                  </button>
                  {notificationsOpen && (
                    <div className="navbar-dropdown">
                      <div className="navbar-dropdown-header">
                        <h3 className="navbar-dropdown-title">Notifications</h3>
                      </div>
                      <div className="navbar-dropdown-empty">
                        Aucune nouvelle notification
                      </div>
                      <Link
                        href="/provider/notifications"
                        className="navbar-dropdown-link"
                      >
                        Voir toutes
                      </Link>
                    </div>
                  )}
                </div>

                <ThemeToggle />

                <div className="relative" ref={profileRef}>
                  <button
                    onClick={() => setProfileOpen(!profileOpen)}
                    className="navbar-avatar-btn"
                  >
                    <div className="navbar-avatar navbar-avatar-green">
                      {user.firstName?.[0]}
                      {user.lastName?.[0]}
                    </div>
                  </button>
                  {profileOpen && (
                    <div className="navbar-dropdown navbar-dropdown-sm">
                      <div className="navbar-dropdown-header">
                        <p className="font-semibold text-sm">
                          {user.firstName} {user.lastName}
                        </p>
                        <p className="navbar-dropdown-text">Fournisseur</p>
                      </div>
                      <div>
                        {providerLinks.map((link) => (
                          <Link
                            key={link.href}
                            href={link.href}
                            className="navbar-profile-item"
                          >
                            {link.label}
                          </Link>
                        ))}
                      </div>
                      <div className="border-t border-[rgb(var(--border))] py-1">
                        <button
                          onClick={handleLogout}
                          className="navbar-profile-logout"
                        >
                          Déconnexion
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="navbar-mobile-actions">
                  <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="navbar-icon-btn"
                  >
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
              {providerLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className="navbar-mobile-link"
                >
                  {link.icon} {link.label}
                </Link>
              ))}
              <button onClick={handleLogout} className="navbar-mobile-logout">
                Déconnexion
              </button>
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
  const adminLinks = [
    { href: '/admin/profile', label: 'Profil admin' },
    { href: '/admin/dashboard', label: 'Supervision' },
    { href: '/admin/users', label: 'Utilisateurs' },
    { href: '/admin/pending-services', label: 'Services à valider' },
    { href: '/admin/reported-reviews', label: 'Avis signalés' },
    { href: '/admin/logs', label: 'Logs' },
    { href: '/admin/alerts', label: 'Alertes' },
  ];

  const adminNavLinks = [
    {
      href: '/admin/dashboard',
      label: 'Supervision',
      icon: <MonitorIcon className="w-4 h-4" />,
    },
    {
      href: '/admin/users',
      label: 'Utilisateurs',
      icon: <UsersIcon className="w-4 h-4" />,
    },
    {
      href: '/admin/pending-services',
      label: 'Services à valider',
      icon: <CheckIcon className="w-4 h-4" />,
    },
    {
      href: '/admin/reported-reviews',
      label: 'Avis signalés',
      icon: <FlagIcon className="w-4 h-4" />,
    },
    {
      href: '/admin/logs',
      label: 'Logs',
      icon: <FileTextIcon className="w-4 h-4" />,
    },
    {
      href: '/admin/alerts',
      label: 'Alertes',
      icon: <AlertTriangleIcon className="w-4 h-4" />,
    },
  ];

  return (
    <>
      <div className="navbar-wrapper">
        <div className="navbar-container">
          <div className="navbar-flex">
            <div className="navbar-logo-group">
              <Logo
                href="/admin/dashboard"
                size="md"
                variant="default"
                animated
              />
              <span className="navbar-admin-badge">ADMIN</span>
            </div>

            <div className="navbar-links">
              {adminNavLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`navbar-link navbar-link-dark ${pathname === link.href ? 'navbar-link-active-dark' : ''}`}
                >
                  {link.icon} {link.label}
                </Link>
              ))}
            </div>

            <div className="navbar-actions">
              <div className="navbar-desktop-actions">
                <div className="relative" ref={notificationsRef}>
                  <button
                    onClick={() => setNotificationsOpen(!notificationsOpen)}
                    className="navbar-icon-btn navbar-icon-btn-dark"
                  >
                    <BellIcon />
                    <span className="navbar-notif-dot"></span>
                  </button>
                  {notificationsOpen && (
                    <div className="navbar-dropdown bg-gray-800 border-gray-700">
                      <div className="navbar-dropdown-header border-gray-700">
                        <h3 className="navbar-dropdown-title text-white">
                          Alertes système
                        </h3>
                      </div>
                      <div className="navbar-dropdown-empty text-gray-400">
                        Aucune alerte
                      </div>
                      <Link
                        href="/admin/alerts"
                        className="navbar-dropdown-link text-gray-300 hover:bg-gray-700 hover:text-blue-400"
                      >
                        Voir toutes
                      </Link>
                    </div>
                  )}
                </div>

                <ThemeToggle />

                <div className="relative" ref={profileRef}>
                  <button
                    onClick={() => setProfileOpen(!profileOpen)}
                    className="navbar-avatar-btn"
                  >
                    <div className="navbar-avatar navbar-avatar-red">
                      {user.firstName?.[0]}
                      {user.lastName?.[0]}
                    </div>
                  </button>
                  {profileOpen && (
                    <div className="navbar-dropdown navbar-dropdown-sm bg-gray-800 border-gray-700">
                      <div className="navbar-dropdown-header border-gray-700">
                        <p className="font-semibold text-sm text-white">
                          {user.firstName} {user.lastName}
                        </p>
                        <p className="navbar-dropdown-text text-gray-400">
                          Administrateur
                        </p>
                      </div>
                      <div>
                        {adminLinks.map((link) => (
                          <Link
                            key={link.href}
                            href={link.href}
                            className="navbar-profile-item text-gray-300 hover:bg-gray-700"
                          >
                            {link.label}
                          </Link>
                        ))}
                      </div>
                      <div className="border-t border-gray-700 py-1">
                        <button
                          onClick={handleLogout}
                          className="navbar-profile-logout text-red-400 hover:bg-gray-700"
                        >
                          Déconnexion
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Bouton burger mobile */}
              <div className="navbar-mobile-actions">
                <ThemeToggle />
                <button
                  onClick={() => setIsOpen(!isOpen)}
                  className="navbar-icon-btn navbar-icon-btn-dark"
                >
                  <BurgerIcon open={isOpen} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Menu mobile admin */}
      {isOpen && (
        <div className="navbar-mobile-menu">
          <div className="navbar-mobile-links">
            {adminNavLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="navbar-mobile-link"
              >
                {link.icon} {link.label}
              </Link>
            ))}
            <div className="border-t border-[rgb(var(--border))] my-2"></div>
            <Link
              href="/admin/profile"
              onClick={() => setIsOpen(false)}
              className="navbar-mobile-link"
            >
              Profil admin
            </Link>
            <button onClick={handleLogout} className="navbar-mobile-logout">
              Déconnexion
            </button>
          </div>
        </div>
      )}
    </>
  );
}

  return null;
}