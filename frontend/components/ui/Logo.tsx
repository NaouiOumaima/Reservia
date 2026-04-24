'use client';

import Link from 'next/link';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'compact' | 'full';
  className?: string;
  onClick?: () => void;
  href?: string;
  ariaLabel?: string;
  showTagline?: boolean;
  animated?: boolean;
}

export default function Logo({
  size = 'md',
  variant = 'default',
  className = '',
  onClick,
  href = '/',
  ariaLabel = 'Reservia - Accueil',
  showTagline = false,
  animated = true,
}: LogoProps) {
  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
  };

  const textSize = {
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-2xl',
  };

  const showText = variant !== 'compact';

  /*
   * Colors pulled from globals.css CSS variables:
   *   --primary       → coral-red  (light) / coral-red bright (dark)
   *   --accent        → sky blue
   *   --success       → emerald green
   *
   * SVG cannot read Tailwind / CSS vars directly, so we use
   * currentColor trick via CSS custom properties on the SVG element.
   * For fills we inline the raw CSS variable values so they respond
   * to .dark class switching at runtime.
   */
  const Icon = () => (
    <svg
      viewBox="0 0 48 48"
      className="w-full h-full"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* ── Background tile — uses surface-overlay token ── */}
      <rect
        x="4" y="4" width="40" height="40" rx="12"
        fill="rgb(var(--foreground))"
        opacity="0.92"
      />

      {/* ── Letter P / R stem ── */}
      <path
        d="M18 34V14H27C30 14 32 16 32 19C32 22 30 24 27 24H18"
        stroke="rgb(var(--background))"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* ── Node central — primary color ── */}
      <circle cx="18" cy="24" r="2.5" fill="rgb(var(--primary))">
        {animated && (
          <>
            <animate attributeName="r"       values="2.5;3.5;2.5" dur="1.5s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="1;0.5;1"     dur="1.5s" repeatCount="indefinite" />
          </>
        )}
      </circle>

      {/* ── Node destination — accent color ── */}
      <circle cx="32" cy="34" r="2.5" fill="rgb(var(--accent))">
        {animated && (
          <animate attributeName="r" values="2.5;3.8;2.5" dur="1.2s" repeatCount="indefinite" />
        )}
      </circle>

      {/* ── Leg of R — animated line, accent color ── */}
      <path
        d="M18 24L32 34"
        stroke="rgb(var(--accent))"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeDasharray="60"
        strokeDashoffset="60"
      >
        {animated && (
          <animate
            attributeName="stroke-dashoffset"
            from="60" to="0"
            dur="1.2s"
            fill="freeze"
          />
        )}
      </path>

      {/* ── Arrow tip — accent color ── */}
      <polygon points="32,38 36,32 28,32" fill="rgb(var(--accent))" opacity="0.85">
        {animated && (
          <animate attributeName="opacity" values="0.85;0.3;0.85" dur="1.2s" repeatCount="indefinite" />
        )}
      </polygon>

      {/* ── Pulse ring — primary color ── */}
      {animated && (
        <circle cx="25" cy="24" r="10" stroke="rgb(var(--primary))" strokeWidth="1" opacity="0.25">
          <animate attributeName="r"       values="8;14;8"   dur="2s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.3;0;0.3" dur="2s" repeatCount="indefinite" />
        </circle>
      )}
    </svg>
  );

  const LogoContent = () => (
    <span className="flex items-center gap-3">
      <span className={sizes[size]}>
        <Icon />
      </span>

      {showText && (
        <span className="flex flex-col">
          <span
            className={`font-display font-semibold tracking-tight leading-none text-[rgb(var(--foreground))] ${textSize[size]}`}
          >
            Reservia
          </span>
          {showTagline && variant === 'full' && (
            <span className="text-xs text-[rgb(var(--foreground-subtle))] mt-0.5">
              Réservation de services
            </span>
          )}
        </span>
      )}
    </span>
  );

  if (onClick) {
    return (
      <button
        onClick={onClick}
        className={`flex items-center gap-3 ${className}`}
        aria-label={ariaLabel}
      >
        <LogoContent />
      </button>
    );
  }

  return (
    <Link
      href={href}
      className={`flex items-center gap-3 ${className}`}
      aria-label={ariaLabel}
    >
      <LogoContent />
    </Link>
  );
}