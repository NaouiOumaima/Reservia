'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import ThemeToggle from './ThemeToggle';
import { User, UserRole } from '@/types';

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

  // Get user from props or localStorage
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    if (propUser) {
      setUser(propUser);
    } else if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch {
          setUser(null);
        }
      }
    }
  }, [propUser]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
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

  // ============================================
  // NAVBAR VISITEUR (non connecté)
  // ============================================
  if (!user) {
    return (
      <nav className="bg-white dark:bg-dark-surface shadow-md dark:shadow-gray-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link href="/" className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                BookingHub
              </Link>
            </div>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center space-x-8">
              <Link 
                href="/" 
                className={`text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium ${pathname === '/' ? 'text-blue-600' : ''}`}
              >
                Accueil
              </Link>
              <Link 
                href="/search" 
                className={`text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium ${pathname === '/search' ? 'text-blue-600' : ''}`}
              >
                Explorer
              </Link>
              <Link 
                href="/about" 
                className={`text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium ${pathname === '/about' ? 'text-blue-600' : ''}`}
              >
                À propos
              </Link>
            </div>

            {/* Auth Buttons */}
            <div className="flex items-center space-x-4">
              <ThemeToggle size="sm" />
              <Link
                href="/login"
                className="px-4 py-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
              >
                Se connecter
              </Link>
              <Link
                href="/register"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
              >
                S&apos;inscrire
              </Link>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  // ============================================
  // NAVBAR CLIENT (connecté)
  // ============================================
  if (user.role === 'client') {
    return (
      <nav className="bg-white dark:bg-dark-surface shadow-md dark:shadow-gray-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link href="/client/dashboard" className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                BookingHub
              </Link>
            </div>

            {/* Main Navigation */}
            <div className="hidden md:flex items-center space-x-6">
              <Link 
                href="/search" 
                className={`flex items-center space-x-1 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 ${pathname === '/search' ? 'text-blue-600' : ''}`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <span>Recherche</span>
              </Link>
              <Link 
                href="/map" 
                className={`flex items-center space-x-1 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 ${pathname === '/map' ? 'text-blue-600' : ''}`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
                <span>Carte</span>
              </Link>
              <Link 
                href="/client/bookings" 
                className={`text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 ${pathname === '/client/bookings' ? 'text-blue-600' : ''}`}
              >
                Mes réservations
              </Link>
              <Link 
                href="/client/favorites" 
                className={`text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 ${pathname === '/client/favorites' ? 'text-blue-600' : ''}`}
              >
                Favoris
              </Link>
            </div>

            {/* Right Side */}
            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <div className="relative" ref={notificationsRef}>
                <button
                  onClick={() => setNotificationsOpen(!notificationsOpen)}
                  className="relative p-2 text-gray-700 dark:text-gray-300 hover:text-blue-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
                </button>
                {notificationsOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-dark-surface rounded-md shadow-lg z-50 border dark:border-gray-700">
                    <div className="p-4 border-b dark:border-gray-700">
                      <h3 className="font-semibold">Notifications</h3>
                    </div>
                    <div className="p-4">
                      <p className="text-gray-500 text-sm">Aucune nouvelle notification</p>
                    </div>
                    <Link href="/client/notifications" className="block p-3 text-center text-blue-600 hover:bg-gray-50 dark:hover:bg-gray-800">
                      Voir toutes
                    </Link>
                  </div>
                )}
              </div>

              <ThemeToggle size="sm" />

              {/* Profile Dropdown */}
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center space-x-2"
                >
                  <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium">
                    {user.firstName?.[0]}{user.lastName?.[0]}
                  </div>
                </button>
                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-dark-surface rounded-md shadow-lg z-50 border dark:border-gray-700">
                    <div className="p-4 border-b dark:border-gray-700">
                      <p className="font-medium">{user.firstName} {user.lastName}</p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                    <div className="py-2">
                      <Link href="/client/profile" className="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">
                        Mon profil
                      </Link>
                      <Link href="/client/preferences" className="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">
                        Préférences
                      </Link>
                      <Link href="/client/reservations" className="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">
                        Historique des réservations
                      </Link>
                      <Link href="/client/reviews" className="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">
                        Mes avis postés
                      </Link>
                      <Link href="/help" className="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">
                        Aide / Tutoriel carte
                      </Link>
                    </div>
                    <div className="border-t dark:border-gray-700 py-2">
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-red-600 hover:bg-gray-50 dark:hover:bg-gray-800"
                      >
                        Déconnexion
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  // ============================================
  // NAVBAR FOURNISSEUR (connecté)
  // ============================================
  if (user.role === 'provider') {
    return (
      <nav className="bg-white dark:bg-dark-surface shadow-md dark:shadow-gray-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link href="/provider/dashboard" className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                BookingHub
              </Link>
            </div>

            {/* Main Navigation */}
            <div className="hidden md:flex items-center space-x-6">
              <Link 
                href="/provider/services" 
                className={`text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 ${pathname === '/provider/services' ? 'text-blue-600' : ''}`}
              >
                Mes services
              </Link>
              <Link 
                href="/provider/location" 
                className={`text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 ${pathname === '/provider/location' ? 'text-blue-600' : ''}`}
              >
                Localisation
              </Link>
              <Link 
                href="/provider/availability" 
                className={`text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 ${pathname === '/provider/availability' ? 'text-blue-600' : ''}`}
              >
                Disponibilités
              </Link>
              <Link 
                href="/provider/bookings" 
                className={`text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 ${pathname === '/provider/bookings' ? 'text-blue-600' : ''}`}
              >
                Réservations
              </Link>
              <Link 
                href="/provider/reviews" 
                className={`text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 ${pathname === '/provider/reviews' ? 'text-blue-600' : ''}`}
              >
                Avis & notes
              </Link>
            </div>

            {/* Right Side */}
            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <div className="relative" ref={notificationsRef}>
                <button
                  onClick={() => setNotificationsOpen(!notificationsOpen)}
                  className="relative p-2 text-gray-700 dark:text-gray-300 hover:text-blue-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
                </button>
                {notificationsOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-dark-surface rounded-md shadow-lg z-50 border dark:border-gray-700">
                    <div className="p-4 border-b dark:border-gray-700">
                      <h3 className="font-semibold">Notifications</h3>
                    </div>
                    <div className="p-4">
                      <p className="text-gray-500 text-sm">Aucune nouvelle notification</p>
                    </div>
                    <Link href="/provider/notifications" className="block p-3 text-center text-blue-600 hover:bg-gray-50 dark:hover:bg-gray-800">
                      Voir toutes
                    </Link>
                  </div>
                )}
              </div>

              <ThemeToggle size="sm" />

              {/* Profile Dropdown */}
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center space-x-2"
                >
                  <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center text-white font-medium">
                    {user.firstName?.[0]}{user.lastName?.[0]}
                  </div>
                </button>
                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-dark-surface rounded-md shadow-lg z-50 border dark:border-gray-700">
                    <div className="p-4 border-b dark:border-gray-700">
                      <p className="font-medium">{user.firstName} {user.lastName}</p>
                      <p className="text-sm text-gray-500">Fournisseur</p>
                    </div>
                    <div className="py-2">
                      <Link href="/provider/profile" className="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">
                        Mon établissement
                      </Link>
                      <Link href="/provider/hours" className="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">
                        Horaires d&apos;ouverture
                      </Link>
                      <Link href="/provider/location" className="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">
                        Vérifier ma position
                      </Link>
                      <Link href="/provider/statistics" className="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">
                        Statistiques avancées
                      </Link>
                      <Link href="/provider/billing" className="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">
                        Abonnement / Facturation
                      </Link>
                    </div>
                    <div className="border-t dark:border-gray-700 py-2">
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-red-600 hover:bg-gray-50 dark:hover:bg-gray-800"
                      >
                        Déconnexion
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  // ============================================
  // NAVBAR ADMINISTRATEUR (connecté)
  // ============================================
  if (user.role === 'admin') {
    return (
      <nav className="bg-gray-900 dark:bg-gray-800 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link href="/admin/dashboard" className="text-2xl font-bold text-white">
                BookingHub <span className="text-xs bg-red-600 px-2 py-1 rounded">ADMIN</span>
              </Link>
            </div>

            {/* Main Navigation */}
            <div className="hidden md:flex items-center space-x-6">
              <Link 
                href="/admin/overview" 
                className={`text-gray-300 hover:text-white ${pathname === '/admin/overview' ? 'text-white font-medium' : ''}`}
              >
                Supervision
              </Link>
              <Link 
                href="/admin/users" 
                className={`text-gray-300 hover:text-white ${pathname === '/admin/users' ? 'text-white font-medium' : ''}`}
              >
                Utilisateurs
              </Link>
              <Link 
                href="/admin/pending-services" 
                className={`text-gray-300 hover:text-white ${pathname === '/admin/pending-services' ? 'text-white font-medium' : ''}`}
              >
                Services à valider
              </Link>
              <Link 
                href="/admin/reported-reviews" 
                className={`text-gray-300 hover:text-white ${pathname === '/admin/reported-reviews' ? 'text-white font-medium' : ''}`}
              >
                Avis signalés
              </Link>
              <Link 
                href="/admin/logs" 
                className={`text-gray-300 hover:text-white ${pathname === '/admin/logs' ? 'text-white font-medium' : ''}`}
              >
                Logs & monitoring
              </Link>
              <Link 
                href="/admin/alerts" 
                className={`text-gray-300 hover:text-white ${pathname === '/admin/alerts' ? 'text-white font-medium' : ''}`}
              >
                Alertes système
              </Link>
            </div>

            {/* Right Side */}
            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <div className="relative" ref={notificationsRef}>
                <button
                  onClick={() => setNotificationsOpen(!notificationsOpen)}
                  className="relative p-2 text-gray-300 hover:text-white"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
                </button>
                {notificationsOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-gray-800 rounded-md shadow-lg z-50 border border-gray-700">
                    <div className="p-4 border-b border-gray-700">
                      <h3 className="font-semibold text-white">Alertes système</h3>
                    </div>
                    <div className="p-4">
                      <p className="text-gray-400 text-sm">Aucune alerte</p>
                    </div>
                    <Link href="/admin/alerts" className="block p-3 text-center text-blue-400 hover:bg-gray-700">
                      Voir toutes
                    </Link>
                  </div>
                )}
              </div>

              <ThemeToggle size="sm" />

              {/* Profile Dropdown */}
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center space-x-2"
                >
                  <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center text-white font-medium">
                    {user.firstName?.[0]}{user.lastName?.[0]}
                  </div>
                </button>
                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-gray-800 rounded-md shadow-lg z-50 border border-gray-700">
                    <div className="p-4 border-b border-gray-700">
                      <p className="font-medium text-white">{user.firstName} {user.lastName}</p>
                      <p className="text-sm text-gray-400">Administrateur</p>
                    </div>
                    <div className="py-2">
                      <Link href="/admin/profile" className="block px-4 py-2 text-gray-300 hover:bg-gray-700">
                        Profil admin
                      </Link>
                    </div>
                    <div className="border-t border-gray-700 py-2">
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-red-400 hover:bg-gray-700"
                      >
                        Déconnexion
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  // Default fallback
  return null;
}
