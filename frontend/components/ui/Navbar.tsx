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

// ── Shared nav wrapper ──────────────────────────────────────────────────────
function NavWrapper({ children, dark = false }: { children: React.ReactNode; dark?: boolean }) {
  return (
    <nav
      className={`nav sticky top-0 z-50 ${
        dark ? 'bg-gray-900 dark:bg-gray-950 border-gray-700' : ''
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-3 items-center h-16">
          {children}
        </div>
      </div>
    </nav>
  );
}

// ── Nav logo wrapper — badge for admin ─────────────────────────────────────
function NavLogo({ href, badge }: { href: string; badge?: string }) {
  return (
    <div className="flex items-center gap-2 shrink-0">
      <Logo href={href} size="md" variant="default" animated />
      {badge && (
        <span className="text-[10px] font-bold tracking-widest uppercase px-2 py-0.5 rounded bg-red-600 text-white">
          {badge}
        </span>
      )}
    </div>
  );
}

// ── Nav link ───────────────────────────────────────────────────────────────
function NavLink({
  href,
  active,
  children,
  dark = false,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
  dark?: boolean;
}) {
  const base = dark
    ? 'text-gray-300 hover:text-white'
    : 'text-[rgb(var(--foreground-muted))] hover:text-[rgb(var(--primary))]';
  const activeClass = dark ? 'text-white font-semibold' : 'text-[rgb(var(--primary))] font-semibold';
  return (
    <Link
      href={href}
      className={`flex items-center gap-1.5 text-sm transition-colors duration-150 whitespace-nowrap ${base} ${active ? activeClass : ''}`}
    >
      {children}
    </Link>
  );
}

// ── Icon button ────────────────────────────────────────────────────────────
function IconButton({
  onClick,
  children,
  dark = false,
}: {
  onClick: () => void;
  children: React.ReactNode;
  dark?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`relative p-2 rounded-full transition-colors duration-150 ${
        dark
          ? 'text-gray-300 hover:text-white hover:bg-gray-700'
          : 'text-[rgb(var(--foreground-muted))] hover:text-[rgb(var(--primary))] hover:bg-[rgb(var(--surface-raised))]'
      }`}
    >
      {children}
    </button>
  );
}

// ── Notification dot ───────────────────────────────────────────────────────
function NotifDot() {
  return (
    <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-gray-900" />
  );
}

// ── Bell icon ──────────────────────────────────────────────────────────────
function BellIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </svg>
  );
}

// ── Burger icon ────────────────────────────────────────────────────────────
function BurgerIcon({ open }: { open: boolean }) {
  return (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      {open ? (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      ) : (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
      )}
    </svg>
  );
}

// ── Notification dropdown ──────────────────────────────────────────────────
function NotifDropdown({
  allLink,
  title,
  dark = false,
}: {
  allLink: string;
  title: string;
  dark?: boolean;
}) {
  const bg = dark ? 'bg-gray-800 border-gray-700' : 'bg-[rgb(var(--surface))] border-[rgb(var(--border))]';
  const divider = dark ? 'border-gray-700' : 'border-[rgb(var(--border))]';
  const text = dark ? 'text-gray-400' : 'text-[rgb(var(--foreground-subtle))]';
  const linkHover = dark ? 'hover:bg-gray-700 text-blue-400' : 'hover:bg-[rgb(var(--surface-raised))] text-[rgb(var(--primary))]';
  return (
    <div className={`absolute right-0 mt-2 w-80 rounded-xl shadow-lg z-50 border overflow-hidden ${bg}`}>
      <div className={`px-4 py-3 border-b ${divider}`}>
        <h3 className="font-semibold text-sm">{title}</h3>
      </div>
      <div className="px-4 py-4">
        <p className={`text-sm ${text}`}>Aucune nouvelle notification</p>
      </div>
      <Link href={allLink} className={`block px-4 py-3 text-center text-sm font-medium border-t transition-colors ${divider} ${linkHover}`}>
        Voir toutes
      </Link>
    </div>
  );
}

// ── Profile dropdown ───────────────────────────────────────────────────────
function ProfileDropdown({
  user,
  links,
  onLogout,
  dark = false,
  role,
}: {
  user: User;
  links: { href: string; label: string }[];
  onLogout: () => void;
  dark?: boolean;
  role?: string;
}) {
  const bg = dark ? 'bg-gray-800 border-gray-700' : 'bg-[rgb(var(--surface))] border-[rgb(var(--border))]';
  const divider = dark ? 'border-gray-700' : 'border-[rgb(var(--border))]';
  const linkClass = dark
    ? 'text-gray-300 hover:bg-gray-700'
    : 'text-[rgb(var(--foreground))] hover:bg-[rgb(var(--surface-raised))]';
  return (
    <div className={`absolute right-0 mt-2 w-56 rounded-xl shadow-lg z-50 border overflow-hidden ${bg}`}>
      <div className={`px-4 py-3 border-b ${divider}`}>
        <p className="font-semibold text-sm">{user.firstName} {user.lastName}</p>
        <p className={`text-xs mt-0.5 ${dark ? 'text-gray-400' : 'text-[rgb(var(--foreground-subtle))]'}`}>
          {role ?? user.email}
        </p>
      </div>
      <div className="py-1">
        {links.map((l) => (
          <Link key={l.href} href={l.href} className={`block px-4 py-2 text-sm transition-colors ${linkClass}`}>
            {l.label}
          </Link>
        ))}
      </div>
      <div className={`border-t py-1 ${divider}`}>
        <button
          onClick={onLogout}
          className={`w-full text-left px-4 py-2 text-sm text-red-500 transition-colors ${
            dark ? 'hover:bg-gray-700' : 'hover:bg-[rgb(var(--surface-raised))]'
          }`}
        >
          Déconnexion
        </button>
      </div>
    </div>
  );
}

// ── Avatar ─────────────────────────────────────────────────────────────────
function Avatar({ user, color = 'bg-[rgb(var(--primary))]' }: { user: User; color?: string }) {
  return (
    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-semibold ${color}`}>
      {user.firstName?.[0]}{user.lastName?.[0]}
    </div>
  );
}

// ── Mobile menu ────────────────────────────────────────────────────────────
function MobileMenu({ links, extra }: { links: { href: string; label: string }[]; extra?: React.ReactNode }) {
  return (
    <div className="border-t border-[rgb(var(--border))] bg-[rgb(var(--surface))]">
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col gap-1">
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="px-3 py-2.5 rounded-lg text-sm font-medium text-[rgb(var(--foreground-muted))] hover:bg-[rgb(var(--surface-raised))] hover:text-[rgb(var(--primary))] transition-colors"
          >
            {l.label}
          </Link>
        ))}
        {extra}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ══════════════════════════════════════════════════════════════════════════════
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

  // ── VISITEUR ──────────────────────────────────────────────────────────────
  if (!user) {
    return (
      <>
        <NavWrapper>
          {/* Col 1 — Logo */}
          <div className="flex items-center">
            <NavLogo href="/" />
          </div>

          {/* Col 2 — Links (centered) */}
          <div className="hidden md:flex items-center justify-center gap-6">
            <NavLink href="/" active={pathname === '/'}>Accueil</NavLink>
            <NavLink href="/search" active={pathname === '/search'}>Explorer</NavLink>
            <NavLink href="/about" active={pathname === '/about'}>À propos</NavLink>
          </div>

          {/* Col 3 — Actions (right) */}
          <div className="flex items-center justify-end gap-3">
            <div className="hidden md:flex items-center gap-3">
              <ThemeToggle />
              <Link href="/login" className="btn btn-ghost btn-sm">Se connecter</Link>
              <Link href="/register" className="btn btn-primary btn-sm">S&apos;inscrire</Link>
            </div>
            <div className="flex md:hidden items-center gap-2">
              <ThemeToggle />
              <IconButton onClick={() => setIsOpen(!isOpen)}><BurgerIcon open={isOpen} /></IconButton>
            </div>
          </div>
        </NavWrapper>

        {isOpen && (
          <MobileMenu
            links={[
              { href: '/', label: 'Accueil' },
              { href: '/search', label: 'Explorer' },
              { href: '/about', label: 'À propos' },
              { href: '/login', label: 'Se connecter' },
              { href: '/register', label: "S'inscrire" },
            ]}
          />
        )}
      </>
    );
  }

  // ── CLIENT ────────────────────────────────────────────────────────────────
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
        <NavWrapper>
          {/* Col 1 — Logo */}
          <div className="flex items-center">
            <NavLogo href="/client/dashboard" />
          </div>

          {/* Col 2 — Links (centered) */}
          <div className="hidden md:flex items-center justify-center gap-6">
            <NavLink href="/search" active={pathname === '/search'}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Recherche
            </NavLink>
            <NavLink href="/map" active={pathname === '/map'}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
              Carte
            </NavLink>
            <NavLink href="/client/bookings" active={pathname === '/client/bookings'}>Mes réservations</NavLink>
            <NavLink href="/client/favorites" active={pathname === '/client/favorites'}>Favoris</NavLink>
          </div>

          {/* Col 3 — Actions (right) */}
          <div className="flex items-center justify-end gap-2">
            <div className="relative" ref={notificationsRef}>
              <IconButton onClick={() => setNotificationsOpen(!notificationsOpen)}>
                <BellIcon /><NotifDot />
              </IconButton>
              {notificationsOpen && <NotifDropdown allLink="/client/notifications" title="Notifications" />}
            </div>

            <ThemeToggle />

            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="rounded-full hover:ring-2 hover:ring-[rgb(var(--primary))] transition-all"
              >
                <Avatar user={user} />
              </button>
              {profileOpen && <ProfileDropdown user={user} links={clientLinks} onLogout={handleLogout} />}
            </div>

            <div className="md:hidden">
              <IconButton onClick={() => setIsOpen(!isOpen)}><BurgerIcon open={isOpen} /></IconButton>
            </div>
          </div>
        </NavWrapper>

        {isOpen && (
          <MobileMenu
            links={[
              { href: '/search', label: 'Recherche' },
              { href: '/map', label: 'Carte' },
              { href: '/client/bookings', label: 'Mes réservations' },
              { href: '/client/favorites', label: 'Favoris' },
              { href: '/client/profile', label: 'Mon profil' },
            ]}
            extra={
              <button
                onClick={handleLogout}
                className="px-3 py-2.5 rounded-lg text-sm font-medium text-red-500 hover:bg-[rgb(var(--surface-raised))] text-left transition-colors"
              >
                Déconnexion
              </button>
            }
          />
        )}
      </>
    );
  }

  // ── PROVIDER ──────────────────────────────────────────────────────────────
  if (user.role === 'provider') {
    const providerLinks = [
      { href: '/provider/profile', label: 'Mon établissement' },
      { href: '/provider/hours', label: "Horaires d'ouverture" },
      { href: '/provider/location', label: 'Vérifier ma position' },
      { href: '/provider/statistics', label: 'Statistiques avancées' },
      { href: '/provider/billing', label: 'Abonnement / Facturation' },
    ];
    return (
      <>
        <NavWrapper>
          {/* Col 1 — Logo */}
          <div className="flex items-center">
            <NavLogo href="/provider/dashboard" />
          </div>

          {/* Col 2 — Links (centered) */}
          <div className="hidden md:flex items-center justify-center gap-5">
            <NavLink href="/provider/services" active={pathname === '/provider/services'}>Mes services</NavLink>
            <NavLink href="/provider/location" active={pathname === '/provider/location'}>Localisation</NavLink>
            <NavLink href="/provider/availability" active={pathname === '/provider/availability'}>Disponibilités</NavLink>
            <NavLink href="/provider/bookings" active={pathname === '/provider/bookings'}>Réservations</NavLink>
            <NavLink href="/provider/reviews" active={pathname === '/provider/reviews'}>Avis & notes</NavLink>
          </div>

          {/* Col 3 — Actions (right) */}
          <div className="flex items-center justify-end gap-2">
            <div className="relative" ref={notificationsRef}>
              <IconButton onClick={() => setNotificationsOpen(!notificationsOpen)}>
                <BellIcon /><NotifDot />
              </IconButton>
              {notificationsOpen && <NotifDropdown allLink="/provider/notifications" title="Notifications" />}
            </div>

            <ThemeToggle />

            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="rounded-full hover:ring-2 hover:ring-[rgb(var(--primary))] transition-all"
              >
                <Avatar user={user} color="bg-emerald-600" />
              </button>
              {profileOpen && <ProfileDropdown user={user} links={providerLinks} onLogout={handleLogout} role="Fournisseur" />}
            </div>

            <div className="md:hidden">
              <IconButton onClick={() => setIsOpen(!isOpen)}><BurgerIcon open={isOpen} /></IconButton>
            </div>
          </div>
        </NavWrapper>

        {isOpen && (
          <MobileMenu
            links={[
              { href: '/provider/services', label: 'Mes services' },
              { href: '/provider/location', label: 'Localisation' },
              { href: '/provider/availability', label: 'Disponibilités' },
              { href: '/provider/bookings', label: 'Réservations' },
              { href: '/provider/reviews', label: 'Avis & notes' },
            ]}
            extra={
              <button
                onClick={handleLogout}
                className="px-3 py-2.5 rounded-lg text-sm font-medium text-red-500 hover:bg-[rgb(var(--surface-raised))] text-left transition-colors"
              >
                Déconnexion
              </button>
            }
          />
        )}
      </>
    );
  }

  // ── ADMIN ─────────────────────────────────────────────────────────────────
  if (user.role === 'admin') {
    const adminLinks = [{ href: '/admin/profile', label: 'Profil admin' }];
    return (
      <NavWrapper dark>
        {/* Col 1 — Logo */}
        <div className="flex items-center">
          <NavLogo href="/admin/dashboard" badge="ADMIN" />
        </div>

        {/* Col 2 — Links (centered) */}
        <div className="hidden md:flex items-center justify-center gap-5">
          <NavLink href="/admin/overview" active={pathname === '/admin/overview'} dark>Supervision</NavLink>
          <NavLink href="/admin/users" active={pathname === '/admin/users'} dark>Utilisateurs</NavLink>
          <NavLink href="/admin/pending-services" active={pathname === '/admin/pending-services'} dark>Services à valider</NavLink>
          <NavLink href="/admin/reported-reviews" active={pathname === '/admin/reported-reviews'} dark>Avis signalés</NavLink>
          <NavLink href="/admin/logs" active={pathname === '/admin/logs'} dark>Logs</NavLink>
          <NavLink href="/admin/alerts" active={pathname === '/admin/alerts'} dark>Alertes</NavLink>
        </div>

        {/* Col 3 — Actions (right) */}
        <div className="flex items-center justify-end gap-2">
          <div className="relative" ref={notificationsRef}>
            <IconButton onClick={() => setNotificationsOpen(!notificationsOpen)} dark>
              <BellIcon /><NotifDot />
            </IconButton>
            {notificationsOpen && <NotifDropdown allLink="/admin/alerts" title="Alertes système" dark />}
          </div>

          <ThemeToggle />

          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="rounded-full hover:ring-2 hover:ring-red-500 transition-all"
            >
              <Avatar user={user} color="bg-red-600" />
            </button>
            {profileOpen && <ProfileDropdown user={user} links={adminLinks} onLogout={handleLogout} role="Administrateur" dark />}
          </div>
        </div>
      </NavWrapper>
    );
  }

  return null;
}