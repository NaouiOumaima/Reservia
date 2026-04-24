// components/ui/Footer.tsx
'use client';

import Link from 'next/link';
import Logo from './Logo';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-[rgb(var(--border))] mt-auto bg-[rgb(var(--surface))]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        
        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          
          {/* Brand avec Logo */}
          <div className="space-y-4">
            <Logo size="md" variant="default" />
            <p className="text-sm text-[rgb(var(--foreground-muted))] leading-relaxed">
              La première plateforme multi-services intelligente en Tunisie.
              Trouvez, comparez et réservez les meilleurs services près de chez vous.
            </p>
            <div className="flex gap-3">
              <a 
                href="#" 
                className="text-[rgb(var(--foreground-muted))] hover:text-[rgb(var(--primary))] transition-colors"
              >
                Facebook
              </a>
              <a 
                href="#" 
                className="text-[rgb(var(--foreground-muted))] hover:text-[rgb(var(--primary))] transition-colors"
              >
                Twitter
              </a>
              <a 
                href="#" 
                className="text-[rgb(var(--foreground-muted))] hover:text-[rgb(var(--primary))] transition-colors"
              >
                LinkedIn
              </a>
              <a 
                href="#" 
                className="text-[rgb(var(--foreground-muted))] hover:text-[rgb(var(--primary))] transition-colors"
              >
                Instagram
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-[rgb(var(--foreground))] mb-4">Liens rapides</h3>
            <ul className="space-y-2">
              <li>
                <Link 
                  href="/" 
                  className="text-sm text-[rgb(var(--foreground-muted))] hover:text-[rgb(var(--primary))] transition-colors"
                >
                  Accueil
                </Link>
              </li>
              <li>
                <Link 
                  href="/search" 
                  className="text-sm text-[rgb(var(--foreground-muted))] hover:text-[rgb(var(--primary))] transition-colors"
                >
                  Explorer
                </Link>
              </li>
              <li>
                <Link 
                  href="/about" 
                  className="text-sm text-[rgb(var(--foreground-muted))] hover:text-[rgb(var(--primary))] transition-colors"
                >
                  À propos
                </Link>
              </li>
              <li>
                <Link 
                  href="/contact" 
                  className="text-sm text-[rgb(var(--foreground-muted))] hover:text-[rgb(var(--primary))] transition-colors"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* For Providers */}
          <div>
            <h3 className="font-semibold text-[rgb(var(--foreground))] mb-4">Pour les fournisseurs</h3>
            <ul className="space-y-2">
              <li>
                <Link 
                  href="/register?role=provider" 
                  className="text-sm text-[rgb(var(--foreground-muted))] hover:text-[rgb(var(--primary))] transition-colors"
                >
                  Devenir partenaire
                </Link>
              </li>
              <li>
                <Link 
                  href="/provider/dashboard" 
                  className="text-sm text-[rgb(var(--foreground-muted))] hover:text-[rgb(var(--primary))] transition-colors"
                >
                  Espace fournisseur
                </Link>
              </li>
              <li>
                <Link 
                  href="#" 
                  className="text-sm text-[rgb(var(--foreground-muted))] hover:text-[rgb(var(--primary))] transition-colors"
                >
                  Tarifs & abonnements
                </Link>
              </li>
              <li>
                <Link 
                  href="#" 
                  className="text-sm text-[rgb(var(--foreground-muted))] hover:text-[rgb(var(--primary))] transition-colors"
                >
                  Centre d'aide
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-[rgb(var(--border))] text-center">
          <p className="text-sm text-[rgb(var(--foreground-muted))]">
            © {currentYear} Reservia. Tous droits réservés.
          </p>
          <p className="text-sm text-[rgb(var(--foreground-muted))] mt-2 flex items-center justify-center gap-1">
            Made with <span className="text-red-500">❤️</span> by Bilel Ammar
          </p>
        </div>
      </div>
    </footer>
  );
}