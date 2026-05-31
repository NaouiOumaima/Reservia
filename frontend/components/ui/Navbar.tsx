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
  DashboardIcon,
} from './Icons';
import NotificationDropdown from '@/app/components/NotificationDropdown';

interface NavbarProps {
  user?: User | null;
}

export default function Navbar({ user: propUser }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  // Close mobile menu on route change
  useEffect(() => {
    setIsOpen(false);
    setProfileOpen(false);
  }, [pathname]);

  // Scroll detection for navbar shadow
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Click outside to close profile dropdown
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  // ============================================
  // PROFILE DROPDOWN
  // ============================================
  const ProfileDropdown = ({ isAdmin = false }: { isAdmin?: boolean }) => (
    <div className={`navbar-dropdown navbar-dropdown-sm ${isAdmin ? 'bg-gray-800 border-gray-700' : ''}`}>
      <div className={`navbar-dropdown-header ${isAdmin ? 'border-gray-700' : ''}`}>
        <p className={`font-semibold text-sm ${isAdmin ? 'text-white' : ''}`}>
          {user?.firstName} {user?.lastName}
        </p>
        <p className={`navbar-dropdown-text ${isAdmin ? 'text-gray-400' : ''}`}>
          {isAdmin ? 'Administrateur' : user?.role === 'provider' ? 'Fournisseur' : user?.email}
        </p>
      </div>
      <div>
        <Link
          href="/profile"
          className={`navbar-profile-item ${isAdmin ? 'text-gray-300 hover:bg-gray-700' : ''}`}
          onClick={() => setProfileOpen(false)}
        >
          {isAdmin ? 'Profil admin' : 'Mon profil'}
        </Link>
      </div>
      <div className={`border-t ${isAdmin ? 'border-gray-700' : 'border-[rgb(var(--border))]'} py-1`}>
        <button
          onClick={handleLogout}
          className={`navbar-profile-logout ${isAdmin ? 'text-red-400 hover:bg-gray-700' : ''}`}
        >
          Déconnexion
        </button>
      </div>
    </div>
  );

  // ============================================
  // SHARED NAV SHELL
  // ============================================
  const NavShell = ({
    logoHref,
    links,
    avatarClass = '',
    isAdmin = false,
    showNotifications = true,
    children,
  }: {
    logoHref: string;
    links: { href: string; label: string; icon: React.ReactNode }[];
    avatarClass?: string;
    isAdmin?: boolean;
    showNotifications?: boolean;
    children?: React.ReactNode;
  }) => (
    <>
      {/* ── NAVBAR BAR ── */}
      <div className={`navbar-wrapper${scrolled ? ' scrolled' : ''}`}>
        <div className="navbar-container">
          <div className="navbar-flex">

            {/* LEFT — Logo */}
            <div className="navbar-logo-group flex-shrink-0">
              <Logo href={logoHref} size="md" variant="default" animated />
              {isAdmin && (
                <span className="navbar-admin-badge hidden sm:inline-flex">ADMIN</span>
              )}
            </div>

            {/* CENTER — Nav links (hidden on mobile) */}
            <nav className="navbar-links" aria-label="Navigation principale">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`navbar-link ${
                    isAdmin
                      ? `navbar-link-dark ${pathname === link.href ? 'navbar-link-active-dark' : ''}`
                      : pathname === link.href
                      ? 'navbar-link-active'
                      : ''
                  }`}
                  title={link.label}
                >
                  {link.icon}
                  <span className="navbar-link-label">{link.label}</span>
                </Link>
              ))}
            </nav>

            {/* RIGHT — Actions */}
            <div className="navbar-actions">
              {showNotifications && (
                <span className="flex-shrink-0">
                  <NotificationDropdown />
                </span>
              )}
              <ThemeToggle />

              {/* Avatar + dropdown */}
              {user && (
                <div className="relative flex-shrink-0" ref={profileRef}>
                  <button
                    onClick={() => setProfileOpen((p) => !p)}
                    className="navbar-avatar-btn"
                    aria-label="Menu profil"
                    aria-expanded={profileOpen}
                  >
                    <div className={`navbar-avatar ${avatarClass}`}>
                      {user.firstName?.[0]}
                      {user.lastName?.[0]}
                    </div>
                  </button>
                  {profileOpen && <ProfileDropdown isAdmin={isAdmin} />}
                </div>
              )}

              {/* Burger — mobile only */}
              <button
                onClick={() => setIsOpen((o) => !o)}
                className={`navbar-icon-btn navbar-burger ${isAdmin ? 'navbar-icon-btn-dark' : ''}`}
                aria-label={isOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
                aria-expanded={isOpen}
              >
                <BurgerIcon open={isOpen} />
              </button>

              {children}
            </div>
          </div>
        </div>
      </div>

      {/* ── MOBILE OVERLAY ── */}
      {isOpen && (
        <div
          className="navbar-overlay"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ── MOBILE MENU ── */}
      <div className={`navbar-mobile-menu${isOpen ? ' navbar-mobile-menu-open' : ''}`} aria-hidden={!isOpen}>
        <div className="navbar-mobile-links">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setIsOpen(false)}
              className={`navbar-mobile-link${pathname === link.href ? ' navbar-mobile-link-active' : ''}`}
            >
              {link.icon}
              {link.label}
            </Link>
          ))}
          <div className="border-t border-[rgb(var(--border))] my-2" />
          <Link
            href="/profile"
            onClick={() => setIsOpen(false)}
            className="navbar-mobile-link"
          >
            {isAdmin ? 'Profil admin' : 'Mon profil'}
          </Link>
          <button onClick={handleLogout} className="navbar-mobile-logout">
            Déconnexion
          </button>
        </div>
      </div>
    </>
  );

  // ============================================
  // VISITEUR
  // ============================================
  if (!user) {
    const guestLinks = [
      { href: '/', label: 'Accueil', icon: <HomeIcon className="w-4 h-4" /> },
      { href: '/search', label: 'Explorer', icon: <CompassIcon className="w-4 h-4" /> },
      { href: '/about', label: 'À propos', icon: <InfoIcon className="w-4 h-4" /> },
    ];

    return (
      <>
        <div className={`navbar-wrapper${scrolled ? ' scrolled' : ''}`}>
          <div className="navbar-container">
            <div className="navbar-flex">
              <div className="navbar-logo-group flex-shrink-0">
                <Logo href="/" size="md" variant="default" animated />
              </div>

              <nav className="navbar-links" aria-label="Navigation principale">
                {guestLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`navbar-link ${pathname === link.href ? 'navbar-link-active' : ''}`}
                  >
                    {link.icon}
                    <span className="navbar-link-label">{link.label}</span>
                  </Link>
                ))}
              </nav>

              <div className="navbar-actions">
                <ThemeToggle />
                <div className="navbar-guest-btns">
                  <Link href="/login" className="btn btn-ghost btn-sm">
                    Connexion
                  </Link>
                  <Link href="/register" className="btn btn-primary btn-sm">
                    S'inscrire
                  </Link>
                </div>
                <button
                  onClick={() => setIsOpen((o) => !o)}
                  className="navbar-icon-btn navbar-burger"
                  aria-label={isOpen ? 'Fermer' : 'Menu'}
                  aria-expanded={isOpen}
                >
                  <BurgerIcon open={isOpen} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {isOpen && (
          <div className="navbar-overlay" onClick={() => setIsOpen(false)} aria-hidden="true" />
        )}

        <div className={`navbar-mobile-menu${isOpen ? ' navbar-mobile-menu-open' : ''}`} aria-hidden={!isOpen}>
          <div className="navbar-mobile-links">
            {guestLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={`navbar-mobile-link${pathname === link.href ? ' navbar-mobile-link-active' : ''}`}
              >
                {link.icon} {link.label}
              </Link>
            ))}
            <div className="border-t border-[rgb(var(--border))] my-2" />
            <Link href="/login" onClick={() => setIsOpen(false)} className="navbar-mobile-link">
              Se connecter
            </Link>
            <Link href="/register" onClick={() => setIsOpen(false)} className="navbar-mobile-link">
              S'inscrire
            </Link>
          </div>
        </div>
      </>
    );
  }

  // ============================================
  // CLIENT
  // ============================================
  if (user.role === 'client') {
    return (
      <NavShell
        logoHref="/client/dashboard"
        links={[
          { href: '/search',                 label: 'Recherche',        icon: <SearchIcon  className="w-4 h-4" /> },
          { href: '/client/carte',           label: 'Carte',            icon: <MapIcon     className="w-4 h-4" /> },
          { href: '/client/bookings',        label: 'Mes réservations', icon: <BookingIcon className="w-4 h-4" /> },
          { href: '/client/favorites',       label: 'Favoris',          icon: <HeartIcon   className="w-4 h-4" /> },
        ]}
      />
    );
  }

  // ============================================
  // PROVIDER
  // ============================================
  if (user.role === 'provider') {
    return (
      <NavShell
        logoHref="/provider/dashboard"
        avatarClass="navbar-avatar-green"
        links={[
          { href: '/provider/dashboard',     label: 'Tableau de bord', icon: <DashboardIcon className="w-4 h-4" /> },
          { href: '/provider/services',      label: 'Mes services',    icon: <ServicesIcon  className="w-4 h-4" /> },
          { href: '/provider/location',      label: 'Localisation',    icon: <LocationIcon  className="w-4 h-4" /> },
          { href: '/provider/availability',  label: 'Disponibilités',  icon: <ClockIcon     className="w-4 h-4" /> },
          { href: '/provider/bookings',      label: 'Réservations',    icon: <BookingIcon   className="w-4 h-4" /> },
          { href: '/provider/reviews',       label: 'Avis & notes',    icon: <ReviewIcon    className="w-4 h-4" /> },
          { href: '/provider/notifications', label: 'Créer une annonce', icon: <MegaphoneIcon className="w-4 h-4" /> },
        ]}
      />
    );
  }

  // ============================================
  // ADMIN
  // ============================================
  if (user.role === 'admin') {
    return (
      <NavShell
        logoHref="/admin/dashboard"
        avatarClass="navbar-avatar-red"
        isAdmin
        showNotifications={true}
        links={[
          { href: '/admin/dashboard',        label: 'Supervision',        icon: <MonitorIcon className="w-4 h-4" /> },
          { href: '/admin/users',            label: 'Utilisateurs',       icon: <UsersIcon   className="w-4 h-4" /> },
          { href: '/admin/pending-services', label: 'Services à valider', icon: <CheckIcon   className="w-4 h-4" /> },
          { href: '/admin/reported-reviews', label: 'Avis signalés',      icon: <FlagIcon    className="w-4 h-4" /> },
        ]}
      />
    );
  }

  return null;
}