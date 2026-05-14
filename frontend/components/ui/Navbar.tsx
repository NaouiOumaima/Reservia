// frontend/components/Navbar.tsx
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
  MegaphoneIcon,
} from './Icons';
import NotificationDropdown from '@/app/components/NotificationDropdown';

interface NavbarProps {
  user?: User | null;
}

export default function Navbar({ user: propUser }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRefDesktop = useRef<HTMLDivElement>(null);
  const profileRefMobile = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  // Gestion du clic en dehors du dropdown
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      const isDesktopClick = profileRefDesktop.current && !profileRefDesktop.current.contains(e.target as Node);
      const isMobileClick = profileRefMobile.current && !profileRefMobile.current.contains(e.target as Node);
      
      if (isDesktopClick && isMobileClick) {
        setProfileOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  // ============================================
  // COMPOSANT DROPDOWN PROFIL (réutilisable)
  // ============================================
  const ProfileDropdownContent = ({ variant = 'default' }: { variant?: 'default' | 'admin' }) => {
    if (variant === 'admin') {
      return (
        <div className="navbar-dropdown navbar-dropdown-sm bg-gray-800 border-gray-700">
          <div className="navbar-dropdown-header border-gray-700">
            <p className="font-semibold text-sm text-white">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="navbar-dropdown-text text-gray-400">Administrateur</p>
          </div>
          <div>
            <Link
              href="/profile"
              className="navbar-profile-item text-gray-300 hover:bg-gray-700"
              onClick={() => setProfileOpen(false)}
            >
              Profil admin
            </Link>
          </div>
          <div className="border-t border-gray-700 py-1">
            <button onClick={handleLogout} className="navbar-profile-logout text-red-400 hover:bg-gray-700">
              Déconnexion
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="navbar-dropdown navbar-dropdown-sm">
        <div className="navbar-dropdown-header">
          <p className="font-semibold text-sm">
            {user?.firstName} {user?.lastName}
          </p>
          <p className="navbar-dropdown-text">
            {user?.role === 'provider' ? 'Fournisseur' : user?.email}
          </p>
        </div>
        <div>
          <Link
            href="/profile"
            className="navbar-profile-item"
            onClick={() => setProfileOpen(false)}
          >
            Mon profil
          </Link>
        </div>
        <div className="border-t border-[rgb(var(--border))] py-1">
          <button onClick={handleLogout} className="navbar-profile-logout">
            Déconnexion
          </button>
        </div>
      </div>
    );
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
    const clientNavLinks = [
      { href: '/search', label: 'Recherche', icon: <SearchIcon className="w-4 h-4" /> },
      { href: '/client/carte', label: 'Carte', icon: <MapIcon className="w-4 h-4" /> },
      { href: '/client/bookings', label: 'Mes réservations', icon: <BookingIcon className="w-4 h-4" /> },
      { href: '/client/favorites', label: 'Favoris', icon: <HeartIcon className="w-4 h-4" /> },
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
                {clientNavLinks.map((link) => (
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
                {/* Version Desktop */}
                <div className="navbar-desktop-actions">
                  <NotificationDropdown />
                  <ThemeToggle />
                  <div className="relative" ref={profileRefDesktop}>
                    <button
                      onClick={() => setProfileOpen(!profileOpen)}
                      className="navbar-avatar-btn"
                    >
                      <div className="navbar-avatar">
                        {user.firstName?.[0]}
                        {user.lastName?.[0]}
                      </div>
                    </button>
                    {profileOpen && <ProfileDropdownContent />}
                  </div>
                </div>

                {/* Version Mobile */}
                <div className="navbar-mobile-actions">
                  <NotificationDropdown />
                  <ThemeToggle />
                  <div className="relative" ref={profileRefMobile}>
                    <button
                      onClick={() => setProfileOpen(!profileOpen)}
                      className="navbar-avatar-btn"
                    >
                      <div className="navbar-avatar">
                        {user.firstName?.[0]}
                        {user.lastName?.[0]}
                      </div>
                    </button>
                    {profileOpen && <ProfileDropdownContent />}
                  </div>
                  <button onClick={() => setIsOpen(!isOpen)} className="navbar-icon-btn">
                    <BurgerIcon open={isOpen} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Menu Mobile */}
        {isOpen && (
          <div className="navbar-mobile-menu">
            <div className="navbar-mobile-links">
              {clientNavLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className="navbar-mobile-link"
                >
                  {link.icon} {link.label}
                </Link>
              ))}
              <Link href="/profile" onClick={() => setIsOpen(false)} className="navbar-mobile-link">
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
    const providerNavLinks = [
      { href: '/provider/dashboard', label: 'Tableau de bord', icon: <GridIcon className="w-4 h-4" /> },
      { href: '/provider/services', label: 'Mes services', icon: <ServicesIcon className="w-4 h-4" /> },
      { href: '/provider/location', label: 'Localisation', icon: <LocationIcon className="w-4 h-4" /> },
      { href: '/provider/availability', label: 'Disponibilités', icon: <ClockIcon className="w-4 h-4" /> },
      { href: '/provider/bookings', label: 'Réservations', icon: <BookingIcon className="w-4 h-4" /> },
      { href: '/provider/reviews', label: 'Avis & notes', icon: <ReviewIcon className="w-4 h-4" /> },
      { href: '/provider/notifications', label: 'Créer une annonce', icon: <MegaphoneIcon className="w-4 h-4" /> },
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
                {providerNavLinks.map((link) => (
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
                {/* Version Desktop */}
                <div className="navbar-desktop-actions">
                  <NotificationDropdown />
                  <ThemeToggle />
                  <div className="relative" ref={profileRefDesktop}>
                    <button
                      onClick={() => setProfileOpen(!profileOpen)}
                      className="navbar-avatar-btn"
                    >
                      <div className="navbar-avatar navbar-avatar-green">
                        {user.firstName?.[0]}
                        {user.lastName?.[0]}
                      </div>
                    </button>
                    {profileOpen && <ProfileDropdownContent />}
                  </div>
                </div>

                {/* Version Mobile */}
                <div className="navbar-mobile-actions">
                  <NotificationDropdown />
                  <ThemeToggle />
                  <div className="relative" ref={profileRefMobile}>
                    <button
                      onClick={() => setProfileOpen(!profileOpen)}
                      className="navbar-avatar-btn"
                    >
                      <div className="navbar-avatar navbar-avatar-green">
                        {user.firstName?.[0]}
                        {user.lastName?.[0]}
                      </div>
                    </button>
                    {profileOpen && <ProfileDropdownContent />}
                  </div>
                  <button onClick={() => setIsOpen(!isOpen)} className="navbar-icon-btn">
                    <BurgerIcon open={isOpen} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Menu Mobile */}
        {isOpen && (
          <div className="navbar-mobile-menu">
            <div className="navbar-mobile-links">
              {providerNavLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className="navbar-mobile-link"
                >
                  {link.icon} {link.label}
                </Link>
              ))}
              <Link href="/profile" onClick={() => setIsOpen(false)} className="navbar-mobile-link">
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
  // ADMIN
  // ============================================
  if (user.role === 'admin') {
    const adminNavLinks = [
      { href: '/admin/dashboard', label: 'Supervision', icon: <MonitorIcon className="w-4 h-4" /> },
      { href: '/admin/users', label: 'Utilisateurs', icon: <UsersIcon className="w-4 h-4" /> },
      { href: '/admin/pending-services', label: 'Services à valider', icon: <CheckIcon className="w-4 h-4" /> },
      { href: '/admin/reported-reviews', label: 'Avis signalés', icon: <FlagIcon className="w-4 h-4" /> },
    ];

    return (
      <>
        <div className="navbar-wrapper">
          <div className="navbar-container">
            <div className="navbar-flex">
              <div className="navbar-logo-group">
                <Logo href="/admin/dashboard" size="md" variant="default" animated />
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
                {/* Version Desktop */}
                <div className="navbar-desktop-actions">
                  <ThemeToggle />
                  <div className="relative" ref={profileRefDesktop}>
                    <button
                      onClick={() => setProfileOpen(!profileOpen)}
                      className="navbar-avatar-btn"
                    >
                      <div className="navbar-avatar navbar-avatar-red">
                        {user.firstName?.[0]}
                        {user.lastName?.[0]}
                      </div>
                    </button>
                    {profileOpen && <ProfileDropdownContent variant="admin" />}
                  </div>
                </div>

                {/* Version Mobile */}
                <div className="navbar-mobile-actions">
                  <ThemeToggle />
                  <div className="relative" ref={profileRefMobile}>
                    <button
                      onClick={() => setProfileOpen(!profileOpen)}
                      className="navbar-avatar-btn"
                    >
                      <div className="navbar-avatar navbar-avatar-red">
                        {user.firstName?.[0]}
                        {user.lastName?.[0]}
                      </div>
                    </button>
                    {profileOpen && <ProfileDropdownContent variant="admin" />}
                  </div>
                  <button onClick={() => setIsOpen(!isOpen)} className="navbar-icon-btn navbar-icon-btn-dark">
                    <BurgerIcon open={isOpen} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Menu Mobile */}
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
              <Link href="/profile" onClick={() => setIsOpen(false)} className="navbar-mobile-link">
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