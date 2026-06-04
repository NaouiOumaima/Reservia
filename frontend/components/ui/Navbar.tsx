'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import ThemeToggle from './ThemeToggle';
import { useAuth } from '@/providers/AuthProvider';
import Logo from './Logo';
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
import { User } from '@/lib/api/users/types';

interface NavbarProps {
  user?: User | null;
}

const getAvatarUrl = (user: User | null | undefined): string | null => {
  if (!user) return null;
  if (user.profileImage) {
    if (user.profileImage.startsWith('http') || user.profileImage.startsWith('data:')) {
      return user.profileImage;
    }
    return `http://localhost:3001${user.profileImage}`;
  }
  if (user.picture && user.picture !== 'null') return user.picture;
  if (user.avatar && user.avatar !== 'null') {
    if (user.avatar.startsWith('http') || user.avatar.startsWith('data:')) return user.avatar;
    return `http://localhost:3001${user.avatar}`;
  }
  return null;
};
// ── Composant MoreMenu ────────────────────────────────────
interface MoreMenuLink {
  href: string;
  label: string;
  icon: React.ReactNode;
}

function MoreMenu({ links, pathname }: { links: MoreMenuLink[]; pathname: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const hasActive = links.some((l) => l.href === pathname);

  return (
    <div className="navbar-more" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className={`navbar-link navbar-more-btn ${hasActive ? 'navbar-link-active' : ''}`}
        data-label="Plus"
      >
        {/* Icône "•••" */}
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/>
        </svg>
        <span className="navbar-link-label">Plus</span>
      </button>

      {open && (
        <div className="navbar-more-dropdown">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className={`navbar-profile-item ${pathname === link.href ? 'navbar-more-item-active' : ''}`}
            >
              <span className="navbar-profile-icon">{link.icon}</span>
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Navbar({ user: propUser }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [avatarError, setAvatarError] = useState(false);
  const profileRefDesktop = useRef<HTMLDivElement>(null);
  const profileRefMobile = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      const isDesktopClick = profileRefDesktop.current && !profileRefDesktop.current.contains(e.target as Node);
      const isMobileClick = profileRefMobile.current && !profileRefMobile.current.contains(e.target as Node);
      if (isDesktopClick && isMobileClick) setProfileOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fermer menu mobile au changement de route
  useEffect(() => {
    setIsOpen(false);
    setProfileOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const avatarUrl = getAvatarUrl(user);
  const showAvatar = avatarUrl && !avatarError;

  // ============================================
  // DROPDOWN PROFIL
  // ============================================
  const ProfileDropdownContent = ({ variant = 'default' }: { variant?: 'default' | 'admin' }) => {
    const dropdownAvatarUrl = getAvatarUrl(user);
    const [dropdownAvatarError, setDropdownAvatarError] = useState(false);
    const showDropdownAvatar = dropdownAvatarUrl && !dropdownAvatarError;

    if (variant === 'admin') {
      return (
        <div className="navbar-dropdown navbar-dropdown-sm navbar-dropdown-admin">
          <div className="navbar-dropdown-header navbar-dropdown-header-admin flex items-center gap-3">
            {showDropdownAvatar ? (
              <img
                src={dropdownAvatarUrl!}
                alt={`${user?.firstName} ${user?.lastName}`}
                className="w-10 h-10 rounded-full object-cover"
                onError={() => setDropdownAvatarError(true)}
              />
            ) : (
              <div className="navbar-dropdown-avatar navbar-dropdown-avatar-red">
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </div>
            )}
            <div>
              <p className="navbar-dropdown-name navbar-dropdown-name-admin">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="navbar-dropdown-text navbar-dropdown-text-admin">Administrateur</p>
            </div>
          </div>
          <div>
            <Link
              href="/profile"
              className="navbar-profile-item navbar-profile-item-admin"
              onClick={() => setProfileOpen(false)}
            >
              Profil admin
            </Link>
          </div>
          <div className="navbar-dropdown-footer-admin">
            <button onClick={handleLogout} className="navbar-profile-logout navbar-profile-logout-admin">
              Déconnexion
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="navbar-dropdown navbar-dropdown-sm">
        <div className="navbar-dropdown-header flex items-center gap-3">
          {showDropdownAvatar ? (
            <img
              src={dropdownAvatarUrl!}
              alt={`${user?.firstName} ${user?.lastName}`}
              className="w-10 h-10 rounded-full object-cover"
              onError={() => setDropdownAvatarError(true)}
            />
          ) : (
            <div className="navbar-dropdown-avatar">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </div>
          )}
          <div>
            <p className="navbar-dropdown-name">{user?.firstName} {user?.lastName}</p>
            <p className="navbar-dropdown-text">
              {user?.role === 'provider' ? 'Fournisseur' : user?.email}
            </p>
          </div>
        </div>
        <div>
          <Link href="/profile" className="navbar-profile-item" onClick={() => setProfileOpen(false)}>
            Mon profil
          </Link>
        </div>
        <div className="navbar-dropdown-footer">
          <button onClick={handleLogout} className="navbar-profile-logout">
            Déconnexion
          </button>
        </div>
      </div>
    );
  };

  // ============================================
  // AVATAR BUTTON
  // ============================================
  const AvatarButton = ({ variant = 'default' }: { variant?: 'default' | 'green' | 'red' }) => {
    const variantClass =
      variant === 'green' ? 'navbar-avatar-green' :
      variant === 'red' ? 'navbar-avatar-red' : '';

    return (
      <button onClick={() => setProfileOpen(!profileOpen)} className="navbar-avatar-btn">
        {showAvatar ? (
          <img
            src={avatarUrl!}
            alt={`${user!.firstName} ${user!.lastName}`}
            className="navbar-avatar-img"
            onError={() => setAvatarError(true)}
          />
        ) : (
          <div className={`navbar-avatar ${variantClass}`}>
            {user!.firstName?.[0]}{user!.lastName?.[0]}
          </div>
        )}
      </button>
    );
  };

  // ============================================
  // VISITEUR
  // ============================================
  if (!user) {
    const visitorLinks = [
      { href: '/', label: 'Accueil', icon: <HomeIcon className="w-4 h-4" /> },
      { href: '/search', label: 'Explorer', icon: <CompassIcon className="w-4 h-4" /> },
      { href: '/about', label: 'À propos', icon: <InfoIcon className="w-4 h-4" /> },
    ];

    return (
      <>
        <nav className="navbar-wrapper">
          <div className="navbar-container">
            <div className="navbar-flex">
              <div className="navbar-logo-group">
                <Logo href="/" size="md" variant="default" animated />
              </div>

              <div className="navbar-links">
                {visitorLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    data-label={link.label}
                    className={`navbar-link ${pathname === link.href ? 'navbar-link-active' : ''}`}
                  >
                    {link.icon}
                    <span className="navbar-link-label">{link.label}</span>
                  </Link>
                ))}
              </div>

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
        </nav>

        {isOpen && (
          <div className="navbar-mobile-menu">
            <div className="navbar-mobile-links">
              {visitorLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className={`navbar-mobile-link ${pathname === link.href ? 'navbar-mobile-link-active' : ''}`}
                >
                  {link.icon} {link.label}
                </Link>
              ))}
              <div className="navbar-mobile-divider" />
              <Link href="/login" onClick={() => setIsOpen(false)} className="navbar-mobile-link">
                Se connecter
              </Link>
              <Link href="/register" onClick={() => setIsOpen(false)} className="navbar-mobile-link navbar-mobile-link-primary">
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
        <nav className="navbar-wrapper">
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
                    data-label={link.label}
                    className={`navbar-link ${pathname === link.href ? 'navbar-link-active' : ''}`}
                  >
                    {link.icon}
                    <span className="navbar-link-label">{link.label}</span>
                  </Link>
                ))}
              </div>

              <div className="navbar-actions">
                <div className="navbar-desktop-actions">
                  <NotificationDropdown />
                  <ThemeToggle />
                  <div className="relative" ref={profileRefDesktop}>
                    <AvatarButton variant="default" />
                    {profileOpen && <ProfileDropdownContent />}
                  </div>
                </div>
                <div className="navbar-mobile-actions">
                  <NotificationDropdown />
                  <ThemeToggle />
                  <div className="relative" ref={profileRefMobile}>
                    <AvatarButton variant="default" />
                    {profileOpen && <ProfileDropdownContent />}
                  </div>
                  <button onClick={() => setIsOpen(!isOpen)} className="navbar-icon-btn">
                    <BurgerIcon open={isOpen} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </nav>

        {isOpen && (
          <div className="navbar-mobile-menu">
            <div className="navbar-mobile-links">
              {clientNavLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className={`navbar-mobile-link ${pathname === link.href ? 'navbar-mobile-link-active' : ''}`}
                >
                  {link.icon} {link.label}
                </Link>
              ))}
              <div className="navbar-mobile-divider" />
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

  // 4 liens visibles, le reste dans "Plus"
  const visibleLinks = providerNavLinks.slice(0, 4);
  const moreLinks = providerNavLinks.slice(4);

  return (
    <>
      <nav className="navbar-wrapper">
        <div className="navbar-container">
          <div className="navbar-flex">
            <div className="navbar-logo-group">
              <Logo href="/provider/dashboard" size="md" variant="default" animated />
            </div>

            <div className="navbar-links">
              {visibleLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  data-label={link.label}
                  className={`navbar-link ${pathname === link.href ? 'navbar-link-active' : ''}`}
                >
                  {link.icon}
                  <span className="navbar-link-label">{link.label}</span>
                </Link>
              ))}

              {/* Menu "Plus" */}
              <MoreMenu links={moreLinks} pathname={pathname} />
            </div>

            <div className="navbar-actions">
              <div className="navbar-desktop-actions">
                <NotificationDropdown />
                <ThemeToggle />
                <div className="relative" ref={profileRefDesktop}>
                  <AvatarButton variant="green" />
                  {profileOpen && <ProfileDropdownContent />}
                </div>
              </div>
              <div className="navbar-mobile-actions">
                <NotificationDropdown />
                <ThemeToggle />
                <div className="relative" ref={profileRefMobile}>
                  <AvatarButton variant="green" />
                  {profileOpen && <ProfileDropdownContent />}
                </div>
                <button onClick={() => setIsOpen(!isOpen)} className="navbar-icon-btn">
                  <BurgerIcon open={isOpen} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {isOpen && (
        <div className="navbar-mobile-menu">
          <div className="navbar-mobile-links">
            {providerNavLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={`navbar-mobile-link ${pathname === link.href ? 'navbar-mobile-link-active' : ''}`}
              >
                {link.icon} {link.label}
              </Link>
            ))}
            <div className="navbar-mobile-divider" />
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
        <nav className="navbar-wrapper">
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
                    data-label={link.label}
                    className={`navbar-link ${pathname === link.href ? 'navbar-link-active' : ''}`}
                  >
                    {link.icon}
                    <span className="navbar-link-label">{link.label}</span>
                  </Link>
                ))}
              </div>

              <div className="navbar-actions">
                <div className="navbar-desktop-actions">
                  <NotificationDropdown />
                  <ThemeToggle />
                  <div className="relative" ref={profileRefDesktop}>
                    <AvatarButton variant="red" />
                    {profileOpen && <ProfileDropdownContent variant="admin" />}
                  </div>
                </div>
                <div className="navbar-mobile-actions">
                  <NotificationDropdown />
                  <ThemeToggle />
                  <div className="relative" ref={profileRefMobile}>
                    <AvatarButton variant="red" />
                    {profileOpen && <ProfileDropdownContent variant="admin" />}
                  </div>
                  <button onClick={() => setIsOpen(!isOpen)} className="navbar-icon-btn">
                    <BurgerIcon open={isOpen} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </nav>

        {isOpen && (
          <div className="navbar-mobile-menu">
            <div className="navbar-mobile-links">
              {adminNavLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className={`navbar-mobile-link ${pathname === link.href ? 'navbar-mobile-link-active' : ''}`}
                >
                  {link.icon} {link.label}
                </Link>
              ))}
              <div className="navbar-mobile-divider" />
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