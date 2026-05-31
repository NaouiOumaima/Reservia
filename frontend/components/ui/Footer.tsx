'use client';

import Link from 'next/link';
import {
  FacebookIcon,
  LinkedinIcon,
  InstagramIcon,
} from './Icons';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-[rgb(var(--border))] bg-surface">
      <div className="container-app py-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">

          {/* Copyright + signature */}
          <p className="text-xs text-muted">
            © {currentYear}{' '}
            <span className="font-medium">Reservia</span>
            {' '}· Made with <span className="text-red-500">♥</span> by Bilel Ammar
          </p>

          {/* Liens */}
          <div className="flex items-center gap-5">
            {[
              { label: 'Confidentialité', href: '/privacy' },
              { label: 'CGU',             href: '/terms' },
              { label: 'Contact',         href: '/contact' },
            ].map(({ label, href }) => (
              <Link key={label} href={href}
                className="text-xs text-muted hover:text-[rgb(var(--primary))] transition-colors">
                {label}
              </Link>
            ))}
          </div>

          {/* Socials */}
          <div className="flex items-center gap-3">
            {[
              { Icon: FacebookIcon,  label: 'Facebook'  },
              { Icon: LinkedinIcon,  label: 'LinkedIn'  },
              { Icon: InstagramIcon, label: 'Instagram' },
            ].map(({ Icon, label }) => (
              <a key={label} href="#" aria-label={label}
                className="text-muted hover:text-[rgb(var(--primary))] transition-colors">
                <Icon className="w-4 h-4" />
              </a>
            ))}
          </div>

        </div>
      </div>
    </footer>
  );
}