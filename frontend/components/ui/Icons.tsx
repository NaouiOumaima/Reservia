// components/ui/Icons.tsx
// Modern icon set — 2026 edition
// Style: 1.6px stroke, round caps/joins, 24×24 grid, optical balance

interface IconProps {
  className?: string;
  size?: number;
}

const base = (className?: string, size?: number) => ({
  className,
  style: size ? { width: size, height: size } : undefined,
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  viewBox: "0 0 24 24",
  xmlns: "http://www.w3.org/2000/svg",
});

// ============================================
// NAVIGATION PRINCIPALE
// ============================================

export function HomeIcon({ className = "w-6 h-6", size }: IconProps) {
  return (
    <svg {...base(className, size)}>
      <path d="M3 11.5L12 3l9 8.5V21a1 1 0 0 1-1 1h-5v-5.5h-6V22H4a1 1 0 0 1-1-1V11.5z" />
    </svg>
  );
}

export function SearchIcon({ className = "w-6 h-6", size }: IconProps) {
  return (
    <svg {...base(className, size)}>
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-2.5-2.5" strokeWidth={2} strokeLinecap="round" />
    </svg>
  );
}

export function MenuIcon({ className = "w-6 h-6", size }: IconProps) {
  return (
    <svg {...base(className, size)}>
      <path d="M4 6h16M4 12h10M4 18h13" />
    </svg>
  );
}

export function BurgerIcon({ open, className = "w-6 h-6", size }: IconProps & { open?: boolean }) {
  return (
    <svg {...base(className, size)}>
      {open ? (
        <path d="M6 18L18 6M6 6l12 12" />
      ) : (
        <>
          <path d="M4 6h16" />
          <path d="M4 12h10" />
          <path d="M4 18h13" />
        </>
      )}
    </svg>
  );
}

export function CloseIcon({ className = "w-6 h-6", size }: IconProps) {
  return (
    <svg {...base(className, size)}>
      <path d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

export function ChevronRightIcon({ className = "w-5 h-5", size }: IconProps) {
  return (
    <svg {...base(className, size)}>
      <path d="M9 6l6 6-6 6" />
    </svg>
  );
}

export function ChevronLeftIcon({ className = "w-5 h-5", size }: IconProps) {
  return (
    <svg {...base(className, size)}>
      <path d="M15 6l-6 6 6 6" />
    </svg>
  );
}

export function ChevronDownIcon({ className = "w-5 h-5", size }: IconProps) {
  return (
    <svg {...base(className, size)}>
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

export function ArrowRightIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

export function CompassIcon({ className = "w-6 h-6", size }: IconProps) {
  return (
    <svg {...base(className, size)}>
      <circle cx="12" cy="12" r="9.5" />
      <path d="M16.5 7.5l-2.8 6.2-6.2 2.8 2.8-6.2 6.2-2.8z" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function InfoIcon({ className = "w-6 h-6", size }: IconProps) {
  return (
    <svg {...base(className, size)}>
      <circle cx="12" cy="12" r="9.5" />
      <path d="M12 11v5" strokeWidth={2} strokeLinecap="round" />
      <circle cx="12" cy="7.5" r="0.6" fill="currentColor" stroke="none" />
    </svg>
  );
}

// ============================================
// ICÔNES PRINCIPALES (APP)
// ============================================

export function MapIcon({ className = "w-6 h-6", size }: IconProps) {
  return (
    <svg {...base(className, size)}>
      <path d="M9 3L3 6v15l6-3 6 3 6-3V3l-6 3-6-3z" />
      <path d="M9 3v15M15 6v15" />
    </svg>
  );
}

export function MapPinIcon({ className = "w-6 h-6", size }: IconProps) {
  return (
    <svg {...base(className, size)}>
      <path d="M12 2.5a6.5 6.5 0 0 1 6.5 6.5c0 5-6.5 12.5-6.5 12.5S5.5 14 5.5 9A6.5 6.5 0 0 1 12 2.5z" />
      <circle cx="12" cy="9" r="2.2" />
    </svg>
  );
}

export function LocationIcon({ className = "w-6 h-6", size }: IconProps) {
  return (
    <svg {...base(className, size)}>
      <path d="M12 2.5a6.5 6.5 0 0 1 6.5 6.5c0 5-6.5 12.5-6.5 12.5S5.5 14 5.5 9A6.5 6.5 0 0 1 12 2.5z" />
      <circle cx="12" cy="9" r="2.2" />
    </svg>
  );
}

export function AiIcon({ className = "w-6 h-6", size }: IconProps) {
  return (
    <svg {...base(className, size)}>
      <path d="M12 2a2 2 0 0 1 2 2v1h1a3 3 0 0 1 3 3v8a3 3 0 0 1-3 3H9a3 3 0 0 1-3-3V8a3 3 0 0 1 3-3h1V4a2 2 0 0 1 2-2z" />
      <circle cx="12" cy="13" r="1.8" fill="currentColor" stroke="none" />
      <path d="M12 14.8v2" strokeWidth={1.8} />
      <path d="M9.5 8.5h5" strokeLinecap="round" />
    </svg>
  );
}

export function BookingIcon({ className = "w-6 h-6", size }: IconProps) {
  return (
    <svg {...base(className, size)}>
      <rect x="3" y="4" width="18" height="17" rx="2.5" />
      <path d="M3 9.5h18" />
      <path d="M8 2.5v3M16 2.5v3" />
      <path d="M7.5 14h2.5M7.5 17.5h4.5" />
      <path d="M14 13.5l1.5 1.5 3-3" />
    </svg>
  );
}

export function NotificationIcon({ className = "w-6 h-6", size }: IconProps) {
  return (
    <svg {...base(className, size)}>
      <path d="M5 10a7 7 0 0 1 14 0c0 3.8 1.6 5.5 2.5 6.5H2.5C3.4 15.5 5 13.8 5 10z" />
      <path d="M10.5 21a1.5 1.5 0 0 0 3 0" />
      <circle cx="18" cy="5" r="2.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function BellIcon({ className = "w-6 h-6", size }: IconProps) {
  return (
    <svg {...base(className, size)}>
      <path d="M5 10a7 7 0 0 1 14 0c0 3.8 1.6 5.5 2.5 6.5H2.5C3.4 15.5 5 13.8 5 10z" />
      <path d="M10.5 21a1.5 1.5 0 0 0 3 0" />
    </svg>
  );
}

export function ReviewIcon({ className = "w-6 h-6", size }: IconProps) {
  return (
    <svg {...base(className, size)}>
      <path d="M12 2.5l2.4 4.8 5.3.77-3.85 3.75.91 5.3L12 14.5l-4.76 2.62.91-5.3L4.3 8.07l5.3-.77L12 2.5z" />
    </svg>
  );
}

export function StarIcon({ className = "w-6 h-6", size }: IconProps) {
  return (
    <svg {...base(className, size)}>
      <path d="M12 2.5l2.4 4.8 5.3.77-3.85 3.75.91 5.3L12 14.5l-4.76 2.62.91-5.3L4.3 8.07l5.3-.77L12 2.5z" />
    </svg>
  );
}

// ============================================
// CATÉGORIES
// ============================================

export function AllCategoriesIcon({ className = "w-6 h-6", size }: IconProps) {
  return (
    <svg {...base(className, size)}>
      <rect x="3" y="3" width="7.5" height="7.5" rx="2" />
      <rect x="13.5" y="3" width="7.5" height="7.5" rx="2" />
      <rect x="3" y="13.5" width="7.5" height="7.5" rx="2" />
      <rect x="13.5" y="13.5" width="7.5" height="7.5" rx="2" />
    </svg>
  );
}

export function GridIcon({ className = "w-6 h-6", size }: IconProps) {
  return (
    <svg {...base(className, size)}>
      <rect x="3" y="3" width="7.5" height="7.5" rx="2" />
      <rect x="13.5" y="3" width="7.5" height="7.5" rx="2" />
      <rect x="3" y="13.5" width="7.5" height="7.5" rx="2" />
      <rect x="13.5" y="13.5" width="7.5" height="7.5" rx="2" />
    </svg>
  );
}

export function RestaurantIcon({ className = "w-6 h-6", size }: IconProps) {
  return (
    <svg {...base(className, size)}>
      <path d="M3 2v7c0 2.2 1.8 4 4 4h.5V22" />
      <path d="M5.5 2v5.5M7 2v5.5" />
      <path d="M14.5 2c0 0 3.5 2 3.5 6.5v2H14.5V2z" />
      <path d="M16.5 10.5V22" />
    </svg>
  );
}

export function HotelIcon({ className = "w-6 h-6", size }: IconProps) {
  return (
    <svg {...base(className, size)}>
      <path d="M2 21V8.5a1 1 0 0 1 .6-.92l9-4a1 1 0 0 1 .8 0l9 4a1 1 0 0 1 .6.92V21" />
      <path d="M2 21h20" />
      <rect x="9" y="13" width="6" height="8" rx="1" />
      <path d="M6 10.5h.5M17.5 10.5h.5M6 14.5h.5M17.5 14.5h.5" strokeWidth={2} strokeLinecap="round" />
    </svg>
  );
}

export function SpaIcon({ className = "w-6 h-6", size }: IconProps) {
  return (
    <svg {...base(className, size)}>
      <path d="M12 21C7.5 21 4 17.2 4 13a8 8 0 0 1 8-8 8 8 0 0 1 8 8c0 4.2-3.5 8-8 8z" />
      <path d="M12 5V3" />
      <path d="M7.5 13.5c.5-2.5 2-4 4.5-4s4 1.5 4.5 4" />
      <path d="M9 7.5C9.5 5.5 10.5 4.5 12 4.5" />
    </svg>
  );
}

export function FitnessIcon({ className = "w-6 h-6", size }: IconProps) {
  return (
    <svg {...base(className, size)}>
      <path d="M6.5 9.5h-2a1 1 0 0 0-1 1v3a1 1 0 0 0 1 1h2" />
      <path d="M17.5 9.5h2a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-2" />
      <path d="M6.5 12h11" />
      <rect x="3.5" y="8" width="3" height="8" rx="1.2" />
      <rect x="17.5" y="8" width="3" height="8" rx="1.2" />
      <path d="M1 10.5v3M23 10.5v3" strokeWidth={2.2} strokeLinecap="round" />
    </svg>
  );
}

export function DumbbellIcon({ className = "w-6 h-6", size }: IconProps) {
  return (
    <svg {...base(className, size)}>
      <path d="M6.5 9.5h-2a1 1 0 0 0-1 1v3a1 1 0 0 0 1 1h2" />
      <path d="M17.5 9.5h2a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-2" />
      <path d="M6.5 12h11" />
      <rect x="3.5" y="8" width="3" height="8" rx="1.2" />
      <rect x="17.5" y="8" width="3" height="8" rx="1.2" />
      <path d="M1 10.5v3M23 10.5v3" strokeWidth={2.2} strokeLinecap="round" />
    </svg>
  );
}

export function HealthIcon({ className = "w-6 h-6", size }: IconProps) {
  return (
    <svg {...base(className, size)}>
      <path d="M2.5 12h3l2.5-8 4.5 16 3.5-11 2 4h3" />
    </svg>
  );
}

export function EducationIcon({ className = "w-6 h-6", size }: IconProps) {
  return (
    <svg {...base(className, size)}>
      <path d="M2 10.5L12 5l10 5.5-10 5.5L2 10.5z" />
      <path d="M6.5 13v5.5a1 1 0 0 0 .6.9l4.4 1.8 4.4-1.8a1 1 0 0 0 .6-.9V13" />
      <path d="M20 10.5V16" strokeLinecap="round" />
    </svg>
  );
}

export function GraduationCapIcon({ className = "w-6 h-6", size }: IconProps) {
  return (
    <svg {...base(className, size)}>
      <path d="M2 10.5L12 5l10 5.5-10 5.5L2 10.5z" />
      <path d="M6.5 13v5.5a1 1 0 0 0 .6.9l4.4 1.8 4.4-1.8a1 1 0 0 0 .6-.9V13" />
      <path d="M20 10.5V16" strokeLinecap="round" />
    </svg>
  );
}

export function EntertainmentIcon({ className = "w-6 h-6", size }: IconProps) {
  return (
    <svg {...base(className, size)}>
      <rect x="2" y="4.5" width="20" height="15" rx="3" />
      <path d="M10 9l5.5 3L10 15V9z" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function GamepadIcon({ className = "w-6 h-6", size }: IconProps) {
  return (
    <svg {...base(className, size)}>
      <path d="M6 12H3.5A1.5 1.5 0 0 1 2 10.5v-2A1.5 1.5 0 0 1 3.5 7h17A1.5 1.5 0 0 1 22 8.5v2a1.5 1.5 0 0 1-1.5 1.5H18l-2 5H8L6 12z" />
      <path d="M7 9.5v3M5.5 11h3" />
      <circle cx="15.5" cy="10.5" r="1" fill="currentColor" stroke="none" />
      <circle cx="18.5" cy="10.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function TransportIcon({ className = "w-6 h-6", size }: IconProps) {
  return (
    <svg {...base(className, size)}>
      <rect x="2" y="8" width="20" height="12" rx="2.5" />
      <path d="M7 8V6.5A4.5 4.5 0 0 1 11.5 2h1A4.5 4.5 0 0 1 17 6.5V8" />
      <circle cx="7" cy="15" r="2" />
      <circle cx="17" cy="15" r="2" />
      <path d="M2 12h20" />
      <path d="M9 15h6" />
    </svg>
  );
}

export function TaxiIcon({ className = "w-6 h-6", size }: IconProps) {
  return (
    <svg {...base(className, size)}>
      <rect x="2" y="8" width="20" height="12" rx="2.5" />
      <path d="M7 8V6.5A4.5 4.5 0 0 1 11.5 2h1A4.5 4.5 0 0 1 17 6.5V8" />
      <circle cx="7" cy="15" r="2" />
      <circle cx="17" cy="15" r="2" />
      <path d="M2 12h20" />
      <path d="M9 15h6" />
    </svg>
  );
}

export function MedicalCrossIcon({ className = "w-6 h-6", size }: IconProps) {
  return (
    <svg {...base(className, size)}>
      <rect x="8.5" y="2" width="7" height="20" rx="2" />
      <rect x="2" y="8.5" width="20" height="7" rx="2" />
    </svg>
  );
}

// ============================================
// STATS & ACTIONS
// ============================================

export function UsersIcon({ className = "w-6 h-6", size }: IconProps) {
  return (
    <svg {...base(className, size)}>
      <circle cx="8.5" cy="7" r="3.5" />
      <path d="M1.5 21v-1.5A6.5 6.5 0 0 1 8 13" />
      <circle cx="16" cy="8" r="3" />
      <path d="M22.5 21v-1a5.5 5.5 0 0 0-11 0v1" />
    </svg>
  );
}

export function ServicesIcon({ className = "w-6 h-6", size }: IconProps) {
  return (
    <svg {...base(className, size)}>
      <rect x="2" y="3" width="20" height="18" rx="2.5" />
      <path d="M2 8.5h20" />
      <path d="M7 13.5h10M7 17h7" />
    </svg>
  );
}

export function TrendingUpIcon({ className = "w-6 h-6", size }: IconProps) {
  return (
    <svg {...base(className, size)}>
      <path d="M3 17l5.5-5.5 4 4L21 6" />
      <path d="M15 6h6v6" />
    </svg>
  );
}

export function CalendarIcon({ className = "w-6 h-6", size }: IconProps) {
  return (
    <svg {...base(className, size)}>
      <rect x="3" y="4" width="18" height="17" rx="2.5" />
      <path d="M3 9.5h18" />
      <path d="M8 2.5v3M16 2.5v3" />
      <path d="M7.5 14h2.5M7.5 17.5h4.5" />
      <path d="M14 13.5l1.5 1.5 3-3" />
    </svg>
  );
}

export function ClockIcon({ className = "w-6 h-6", size }: IconProps) {
  return (
    <svg {...base(className, size)}>
      <circle cx="12" cy="12" r="9.5" />
      <path d="M12 6.5V12l3.5 2" strokeWidth={1.8} />
    </svg>
  );
}

export function HeartIcon({ className = "w-6 h-6", size }: IconProps) {
  return (
    <svg {...base(className, size)}>
      <path d="M20.5 4.6a5 5 0 0 0-7.07 0L12 6.07l-1.43-1.47a5 5 0 0 0-7.07 7.07L12 20.5l8.5-8.83a5 5 0 0 0 0-7.07z" />
    </svg>
  );
}

export function CheckIcon({ className = "w-6 h-6", size }: IconProps) {
  return (
    <svg {...base(className, size)}>
      <path d="M4 13l5 5L20 6" strokeWidth={2} />
    </svg>
  );
}

export function CheckCircleIcon({ className = "w-6 h-6", size }: IconProps) {
  return (
    <svg {...base(className, size)}>
      <circle cx="12" cy="12" r="9.5" />
      <path d="M8 12.5l2.5 2.5 5.5-5.5" />
    </svg>
  );
}

// ============================================
// RÉSEAUX SOCIAUX
// ============================================

export function FacebookIcon({ className = "w-6 h-6", size }: IconProps) {
  return (
    <svg {...base(className, size)}>
      <path d="M17.5 2h-2.8A4.7 4.7 0 0 0 10 6.7V9H7v4h3v9h4v-9h3l.5-4h-3.5V6.8a.8.8 0 0 1 .8-.8h2.7V2z" />
    </svg>
  );
}

export function TwitterIcon({ className = "w-6 h-6", size }: IconProps) {
  return (
    <svg {...base(className, size)}>
      <path d="M4 4h5.5L20 20h-5.5L4 4z" />
      <path d="M4 20l6-6.5M14 10.5L20 4" />
    </svg>
  );
}

export function LinkedinIcon({ className = "w-6 h-6", size }: IconProps) {
  return (
    <svg {...base(className, size)}>
      <rect x="2" y="9" width="4" height="12" rx="1.5" />
      <circle cx="4" cy="5" r="2" />
      <path d="M15.5 8A5.5 5.5 0 0 1 21 13.5V21h-4v-7a2 2 0 0 0-4 0v7h-4V9h4v1.5" />
    </svg>
  );
}

export function InstagramIcon({ className = "w-6 h-6", size }: IconProps) {
  return (
    <svg {...base(className, size)}>
      <rect x="2" y="2" width="20" height="20" rx="5.5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.6" cy="6.4" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

// ============================================
// À PROPOS / FEATURES
// ============================================

export function TargetIcon({ className = "w-6 h-6", size }: IconProps) {
  return (
    <svg {...base(className, size)}>
      <circle cx="12" cy="12" r="9.5" />
      <circle cx="12" cy="12" r="5.5" />
      <circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none" />
      <path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2" />
    </svg>
  );
}

export function ShieldIcon({ className = "w-6 h-6", size }: IconProps) {
  return (
    <svg {...base(className, size)}>
      <path d="M12 2.5l8 3.5v5.5c0 5.5-3.8 9.8-8 11.5C7.8 21.3 4 17 4 11.5V6l8-3.5z" />
    </svg>
  );
}

export function ShieldCheckIcon({ className = "w-6 h-6", size }: IconProps) {
  return (
    <svg {...base(className, size)}>
      <path d="M12 2.5l8 3.5v5.5c0 5.5-3.8 9.8-8 11.5C7.8 21.3 4 17 4 11.5V6l8-3.5z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  );
}

export function HeadphonesIcon({ className = "w-6 h-6", size }: IconProps) {
  return (
    <svg {...base(className, size)}>
      <path d="M3.5 16.5v-3.5a8.5 8.5 0 0 1 17 0v3.5" />
      <rect x="2" y="15.5" width="4.5" height="6" rx="2" />
      <rect x="17.5" y="15.5" width="4.5" height="6" rx="2" />
    </svg>
  );
}

// ============================================
// GESTION UTILISATEURS (ADMIN)
// ============================================

export function UserIcon({ className = "w-6 h-6", size }: IconProps) {
  return (
    <svg {...base(className, size)}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21v-1a8 8 0 0 1 16 0v1" />
    </svg>
  );
}

export function BanIcon({ className = "w-6 h-6", size }: IconProps) {
  return (
    <svg {...base(className, size)}>
      <circle cx="12" cy="12" r="9.5" />
      <path d="M5.3 5.3l13.4 13.4" />
    </svg>
  );
}

export function XMarkIcon({ className = "w-6 h-6", size }: IconProps) {
  return (
    <svg {...base(className, size)}>
      <path d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

export function PhoneIcon({ className = "w-6 h-6", size }: IconProps) {
  return (
    <svg {...base(className, size)}>
      <path d="M6.5 2h3.5a1 1 0 0 1 1 .9l.6 4a1 1 0 0 1-.5 1l-1.8 1a13 13 0 0 0 5.8 5.8l1-1.8a1 1 0 0 1 1-.5l4 .6a1 1 0 0 1 .9 1V17.5A2.5 2.5 0 0 1 19.5 20C9.8 20 4 14.2 4 4.5A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  );
}

export function EnvelopeIcon({ className = "w-6 h-6", size }: IconProps) {
  return (
    <svg {...base(className, size)}>
      <rect x="2" y="4.5" width="20" height="15" rx="2.5" />
      <path d="M2 8l10 6.5L22 8" />
    </svg>
  );
}

export function BuildingOfficeIcon({ className = "w-6 h-6", size }: IconProps) {
  return (
    <svg {...base(className, size)}>
      <path d="M3 21V6.5A1.5 1.5 0 0 1 4.5 5h15A1.5 1.5 0 0 1 21 6.5V21" />
      <path d="M3 21h18" />
      <path d="M9 21V16h6v5" />
      <path d="M7 9.5h2M15 9.5h2M7 13h2M15 13h2" strokeWidth={1.8} strokeLinecap="round" />
    </svg>
  );
}

export function TrashIcon({ className = "w-6 h-6", size }: IconProps) {
  return (
    <svg {...base(className, size)}>
      <path d="M3 6.5h18M8 6.5V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v1.5" />
      <rect x="5" y="6.5" width="14" height="14.5" rx="2" />
      <path d="M10 11v6M14 11v6" />
    </svg>
  );
}

export function CameraIcon({ className = "w-6 h-6", size }: IconProps) {
  return (
    <svg {...base(className, size)}>
      <path d="M22 18.5a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8.5a2 2 0 0 1 2-2h2.5l2-3h7l2 3H20a2 2 0 0 1 2 2v10z" />
      <circle cx="12" cy="13.5" r="3.5" />
    </svg>
  );
}

export function LockIcon({ className = "w-6 h-6", size }: IconProps) {
  return (
    <svg {...base(className, size)}>
      <rect x="3" y="11" width="18" height="11" rx="2.5" />
      <path d="M7.5 11V7.5a4.5 4.5 0 0 1 9 0V11" />
      <circle cx="12" cy="16.5" r="1.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function EyeIcon({ className = "w-6 h-6", size }: IconProps) {
  return (
    <svg {...base(className, size)}>
      <path d="M1.5 12S5 4.5 12 4.5 22.5 12 22.5 12 19 19.5 12 19.5 1.5 12 1.5 12z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

export function ViewIcon({ className = "w-6 h-6", size }: IconProps) {
  return (
    <svg {...base(className, size)}>
      <path d="M1.5 12S5 4.5 12 4.5 22.5 12 22.5 12 19 19.5 12 19.5 1.5 12 1.5 12z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

export function EyeSlashIcon({ className = "w-6 h-6", size }: IconProps) {
  return (
    <svg {...base(className, size)}>
      <path d="M17.5 17.5A10.5 10.5 0 0 1 12 19.5C5 19.5 1.5 12 1.5 12a18.5 18.5 0 0 1 5-5.5M9.5 4.8A9.5 9.5 0 0 1 12 4.5C19 4.5 22.5 12 22.5 12a18.5 18.5 0 0 1-2.5 3.5" />
      <path d="M14.1 14.1a3 3 0 0 1-4.24-4.24" />
      <path d="M2 2l20 20" />
    </svg>
  );
}

export function PencilIcon({ className = "w-6 h-6", size }: IconProps) {
  return (
    <svg {...base(className, size)}>
      <path d="M15.5 3.5a2.12 2.12 0 0 1 3 3L7 18l-4 1 1-4L15.5 3.5z" />
    </svg>
  );
}

export function SaveIcon({ className = "w-6 h-6", size }: IconProps) {
  return (
    <svg {...base(className, size)}>
      <path d="M18.5 21H5.5A2.5 2.5 0 0 1 3 18.5v-13A2.5 2.5 0 0 1 5.5 3h10.5l5 5v10.5A2.5 2.5 0 0 1 18.5 21z" />
      <path d="M17 21v-8H7v8" />
      <path d="M7 3v5.5h7" />
    </svg>
  );
}

export function BriefcaseIcon({ className = "w-6 h-6", size }: IconProps) {
  return (
    <svg {...base(className, size)}>
      <rect x="2" y="7.5" width="20" height="13" rx="2.5" />
      <path d="M15.5 7.5V5.5A2.5 2.5 0 0 0 13 3h-2a2.5 2.5 0 0 0-2.5 2.5v2" />
      <path d="M2 13h20" />
    </svg>
  );
}

// ============================================
// SETTINGS & SYSTEM
// ============================================

export function SettingsIcon({ className = "w-6 h-6", size }: IconProps) {
  return (
    <svg {...base(className, size)}>
      <circle cx="12" cy="12" r="3" />
      <path d="M20 12a8.4 8.4 0 0 1-.3 2.1l2 1.5-1.7 3-2.3-.8a8 8 0 0 1-3.6 2.1l-.4 2.4h-3.4l-.4-2.4a8 8 0 0 1-3.6-2.1l-2.3.8-1.7-3 2-1.5A8.4 8.4 0 0 1 4 12a8.4 8.4 0 0 1 .3-2.1l-2-1.5 1.7-3 2.3.8A8 8 0 0 1 9.9 4.1L10.3 1.7h3.4l.4 2.4a8 8 0 0 1 3.6 2.1l2.3-.8 1.7 3-2 1.5A8.4 8.4 0 0 1 20 12z" />
    </svg>
  );
}

export function MonitorIcon({ className = "w-6 h-6", size }: IconProps) {
  return (
    <svg {...base(className, size)}>
      <rect x="2" y="3" width="20" height="14" rx="2.5" />
      <path d="M8.5 21h7M12 17v4" />
    </svg>
  );
}

export function FlagIcon({ className = "w-6 h-6", size }: IconProps) {
  return (
    <svg {...base(className, size)}>
      <path d="M4 21V3" />
      <path d="M4 4h14l-3 5.5 3 5.5H4" />
    </svg>
  );
}

export function FileTextIcon({ className = "w-6 h-6", size }: IconProps) {
  return (
    <svg {...base(className, size)}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8L14 2z" />
      <path d="M14 2v6h6" />
      <path d="M8 13h8M8 17h5" />
    </svg>
  );
}

export function AlertTriangleIcon({ className = "w-6 h-6", size }: IconProps) {
  return (
    <svg {...base(className, size)}>
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <path d="M12 10v4" strokeWidth={2} strokeLinecap="round" />
      <circle cx="12" cy="17.5" r="0.6" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function Loader2Icon({ className = "w-6 h-6", size }: IconProps) {
  return (
    <svg {...base(className, size)} strokeWidth={2}>
      <path d="M21 12a9 9 0 1 1-6.22-8.56" />
    </svg>
  );
}

// ============================================
// PROMOTIONS & TAGS
// ============================================

export function TagIcon({ className = "w-6 h-6", size }: IconProps) {
  return (
    <svg {...base(className, size)}>
      <path d="M12.5 2H7a1 1 0 0 0-.7.3L2.3 6.3A1 1 0 0 0 2 7v5.6a1 1 0 0 0 .3.7l8.4 8.4a2 2 0 0 0 2.8 0l7-7a2 2 0 0 0 0-2.8L12.5 2z" />
      <circle cx="7.5" cy="7.5" r="1.2" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function PercentIcon({ className = "w-6 h-6", size }: IconProps) {
  return (
    <svg {...base(className, size)}>
      <path d="M19 5L5 19" />
      <circle cx="6.5" cy="6.5" r="2.5" />
      <circle cx="17.5" cy="17.5" r="2.5" />
    </svg>
  );
}

export function MegaphoneIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 11v2a2 2 0 0 0 2 2h1.5l2 4h2l-1-4H11a1 1 0 0 0 1-1V8a1 1 0 0 0-1-1H9.5L7.5 5H5a2 2 0 0 0-2 2v2z" />
      <path d="M19.5 7.5C20.9 8.7 21.8 10.2 22 12c-.2 1.8-1.1 3.3-2.5 4.5" />
      <path d="M17 9.5c.9.8 1.4 1.9 1.4 2.5 0 .6-.5 1.7-1.4 2.5" />
    </svg>
  );
}

// ============================================
// UPLOAD & MISC
// ============================================

export function UploadIcon({ className = "w-6 h-6", size }: IconProps) {
  return (
    <svg {...base(className, size)}>
      <path d="M12 15V3M8 7l4-4 4 4" />
      <path d="M20 15v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-4" />
    </svg>
  );
}

export function LipstickIcon({ className = "w-6 h-6", size }: IconProps) {
  return (
    <svg {...base(className, size)}>
      <path d="M10 22V11.5L8 8V4.5A1.5 1.5 0 0 1 9.5 3h5A1.5 1.5 0 0 1 16 4.5V8l-2 3.5V22" />
      <path d="M10 22h4" />
      <path d="M8 8h8" />
    </svg>
  );
}

export function PlateEatingIcon({ className = "w-6 h-6", size }: IconProps) {
  return (
    <svg {...base(className, size)}>
      <path d="M2.5 12A9.5 9.5 0 0 1 12 2.5 9.5 9.5 0 0 1 21.5 12" />
      <path d="M2.5 12h19" />
      <path d="M12 12v9.5" />
      <path d="M8.5 12a3.5 3.5 0 0 1 7 0" />
    </svg>
  );
}

export function BedIcon({ className = "w-6 h-6", size }: IconProps) {
  return (
    <svg {...base(className, size)}>
      <path d="M3 21v-5a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v5" />
      <path d="M3 16h18" />
      <path d="M3 12V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v7" />
      <rect x="7" y="9" width="4" height="3" rx="1" />
    </svg>
  );
}