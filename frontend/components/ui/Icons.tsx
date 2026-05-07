// components/ui/Icons.tsx

interface IconProps {
  className?: string;
  size?: number;
}

const defaultProps = (className?: string, size?: number) => ({
  className,
  style: size ? { width: size, height: size } : undefined,
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.75,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  viewBox: "0 0 24 24",
});

// ============================================
// ICÔNES PRINCIPALES
// ============================================

export function SearchIcon({ className = "w-6 h-6", size }: IconProps) {
  return (
    <svg {...defaultProps(className, size)}>
      <circle cx="11" cy="11" r="7" />
      <path d="M17 17l3.5 3.5" />
    </svg>
  );
}

export function MapIcon({ className = "w-6 h-6", size }: IconProps) {
  return (
    <svg {...defaultProps(className, size)}>
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
      <circle cx="12" cy="9" r="2.5" />
    </svg>
  );
}

export function AiIcon({ className = "w-6 h-6", size }: IconProps) {
  return (
    <svg {...defaultProps(className, size)}>
      <path d="M12 2a4 4 0 0 1 4 4v1h1a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h1V6a4 4 0 0 1 4-4z" />
      <circle cx="12" cy="13" r="2" fill="currentColor" stroke="none" />
      <path d="M12 15v2" />
    </svg>
  );
}

export function BookingIcon({ className = "w-6 h-6", size }: IconProps) {
  return (
    <svg {...defaultProps(className, size)}>
      <rect x="3" y="4" width="18" height="17" rx="2.5" />
      <path d="M3 9h18" />
      <path d="M8 2v4M16 2v4" />
      <path d="M8 13h2M8 17h5" />
      <path d="M14 13l1.5 1.5L18 11" />
    </svg>
  );
}

export function ReviewIcon({ className = "w-6 h-6", size }: IconProps) {
  return (
    <svg {...defaultProps(className, size)}>
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

export function NotificationIcon({ className = "w-6 h-6", size }: IconProps) {
  return (
    <svg {...defaultProps(className, size)}>
      <path d="M6 8a6 6 0 0 1 12 0c0 4 2 6 2 6H4s2-2 2-6" />
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
      <circle cx="18" cy="4" r="2.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

// ============================================
// ICÔNES POUR CATÉGORIES
// ============================================

export function AllCategoriesIcon({ className = "w-6 h-6", size }: IconProps) {
  return (
    <svg {...defaultProps(className, size)}>
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </svg>
  );
}

export function RestaurantIcon({ className = "w-6 h-6", size }: IconProps) {
  return (
    <svg {...defaultProps(className, size)}>
      <path d="M3 11l9-9 9 9" />
      <path d="M5 9v11a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V9" />
      <path d="M9 22V12h6v10" />
    </svg>
  );
}

export function HotelIcon({ className = "w-6 h-6", size }: IconProps) {
  return (
    <svg {...defaultProps(className, size)}>
      <path d="M3 22V10l9-8 9 8v12" />
      <rect x="9" y="14" width="6" height="8" rx="1" />
      <rect x="6" y="10" width="3" height="3" rx="0.5" />
      <rect x="15" y="10" width="3" height="3" rx="0.5" />
    </svg>
  );
}

export function SpaIcon({ className = "w-6 h-6", size }: IconProps) {
  return (
    <svg {...defaultProps(className, size)}>
      <path d="M12 22c-4 0-8-4-8-9a8 8 0 0 1 16 0c0 5-4 9-8 9z" />
      <path d="M8 13c.5-2.5 2-4 4-4s3.5 1.5 4 4" />
      <path d="M12 9v-3" />
    </svg>
  );
}

export function FitnessIcon({ className = "w-6 h-6", size }: IconProps) {
  return (
    <svg {...defaultProps(className, size)}>
      <path d="M6.5 6.5h11M6.5 17.5h11M12 6.5v11" />
      <circle cx="4" cy="6.5" r="1.5" />
      <circle cx="4" cy="17.5" r="1.5" />
      <circle cx="20" cy="6.5" r="1.5" />
      <circle cx="20" cy="17.5" r="1.5" />
      <path d="M2 8.5v7M22 8.5v7" strokeWidth={2.5} />
    </svg>
  );
}

export function HealthIcon({ className = "w-6 h-6", size }: IconProps) {
  return (
    <svg {...defaultProps(className, size)}>
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
  );
}

export function EducationIcon({ className = "w-6 h-6", size }: IconProps) {
  return (
    <svg {...defaultProps(className, size)}>
      <path d="M2 10l10-7 10 7-10 7z" />
      <path d="M6 12v7a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-7" />
    </svg>
  );
}

export function EntertainmentIcon({ className = "w-6 h-6", size }: IconProps) {
  return (
    <svg {...defaultProps(className, size)}>
      <rect x="2" y="5" width="20" height="15" rx="2" />
      <path d="M10 9l5 3-5 3V9z" />
    </svg>
  );
}

export function TransportIcon({ className = "w-6 h-6", size }: IconProps) {
  return (
    <svg {...defaultProps(className, size)}>
      <rect x="1" y="8" width="22" height="12" rx="2" />
      <path d="M16 8V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v3" />
      <circle cx="7" cy="15" r="2" />
      <circle cx="17" cy="15" r="2" />
      <path d="M1 12h22" />
    </svg>
  );
}

// ============================================
// ICÔNES POUR STATS & ACTIONS
// ============================================

export function UsersIcon({ className = "w-6 h-6", size }: IconProps) {
  return (
    <svg {...defaultProps(className, size)}>
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

export function ServicesIcon({ className = "w-6 h-6", size }: IconProps) {
  return (
    <svg {...defaultProps(className, size)}>
      <rect x="2" y="3" width="20" height="18" rx="2" />
      <path d="M2 7h20" />
      <circle cx="6" cy="5" r="0.8" fill="currentColor" stroke="none" />
      <circle cx="9.5" cy="5" r="0.8" fill="currentColor" stroke="none" />
      <path d="M8 11h8M8 15h5" />
    </svg>
  );
}

export function LocationIcon({ className = "w-6 h-6", size }: IconProps) {
  return (
    <svg {...defaultProps(className, size)}>
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
      <circle cx="12" cy="9" r="2.5" />
    </svg>
  );
}

export function StarIcon({ className = "w-6 h-6", size }: IconProps) {
  return (
    <svg {...defaultProps(className, size)}>
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

// ============================================
// ICÔNES POUR NAVIGATION
// ============================================

export function MenuIcon({ className = "w-6 h-6", size }: IconProps) {
  return (
    <svg {...defaultProps(className, size)}>
      <path d="M4 7h16M4 12h10M4 17h13" />
    </svg>
  );
}

export function CloseIcon({ className = "w-6 h-6", size }: IconProps) {
  return (
    <svg {...defaultProps(className, size)}>
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  );
}

export function ChevronRightIcon({ className = "w-5 h-5", size }: IconProps) {
  return (
    <svg {...defaultProps(className, size)}>
      <path d="M9 18l6-6-6-6" />
    </svg>
  );
}

export function ChevronLeftIcon({ className = "w-5 h-5", size }: IconProps) {
  return (
    <svg {...defaultProps(className, size)}>
      <path d="M15 18l-6-6 6-6" />
    </svg>
  );
}

// ============================================
// ICÔNES POUR FOOTER & RÉSEAUX SOCIAUX
// ============================================

export function FacebookIcon({ className = "w-6 h-6", size }: IconProps) {
  return (
    <svg {...defaultProps(className, size)}>
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

export function TwitterIcon({ className = "w-6 h-6", size }: IconProps) {
  return (
    <svg {...defaultProps(className, size)}>
      <path d="M4 4l16 16" />
      <path d="M4 4h5.5l10.5 16H14.5z" />
    </svg>
  );
}

export function LinkedinIcon({ className = "w-6 h-6", size }: IconProps) {
  return (
    <svg {...defaultProps(className, size)}>
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

export function InstagramIcon({ className = "w-6 h-6", size }: IconProps) {
  return (
    <svg {...defaultProps(className, size)}>
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

// ============================================
// ICÔNES POUR PAGE À PROPOS
// ============================================

export function CalendarIcon({ className = "w-6 h-6", size }: IconProps) {
  return (
    <svg {...defaultProps(className, size)}>
      <rect x="3" y="4" width="18" height="17" rx="2.5" />
      <path d="M3 9h18" />
      <path d="M8 2v4M16 2v4" />
      <path d="M8 13h2M8 17h5" />
      <path d="M14 13l1.5 1.5L18 11" />
    </svg>
  );
}

export function TargetIcon({ className = "w-6 h-6", size }: IconProps) {
  return (
    <svg {...defaultProps(className, size)}>
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" fill="currentColor" stroke="none" />
      <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
    </svg>
  );
}

export function ShieldIcon({ className = "w-6 h-6", size }: IconProps) {
  return (
    <svg {...defaultProps(className, size)}>
      <path d="M12 2l7 4v5c0 5-3.5 9.3-7 10.5C8.5 20.3 5 16 5 11V6l7-4z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  );
}

export function HeadphonesIcon({ className = "w-6 h-6", size }: IconProps) {
  return (
    <svg {...defaultProps(className, size)}>
      <path d="M3 18v-2a5 5 0 0 1 5-5h8a5 5 0 0 1 5 5v2" />
      <path d="M8 11V7a4 4 0 1 1 8 0v4" />
      <path d="M5 18h14" />
    </svg>
  );
}

export function CheckIcon({ className = "w-6 h-6", size }: IconProps) {
  return (
    <svg {...defaultProps(className, size)}>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

// ============================================
// ICÔNES SPÉCIFIQUES POUR PAGE ACCUEIL
// ============================================

export function LipstickIcon({ className = "w-6 h-6", size }: IconProps) {
  return (
    <svg {...defaultProps(className, size)}>
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
      <path d="M9 11l2 2 4-4" />
    </svg>
  );
}

export function PlateEatingIcon({ className = "w-6 h-6", size }: IconProps) {
  return (
    <svg {...defaultProps(className, size)}>
      <circle cx="12" cy="12" r="9" />
      <path d="M8 12c0-2.2 1.8-4 4-4s4 1.8 4 4" />
      <path d="M7 15h10" />
    </svg>
  );
}

export function BedIcon({ className = "w-6 h-6", size }: IconProps) {
  return (
    <svg {...defaultProps(className, size)}>
      <path d="M3 22V10l9-8 9 8v12" />
      <rect x="9" y="14" width="6" height="8" rx="1" />
      <path d="M10 9h4" />
    </svg>
  );
}

export function DumbbellIcon({ className = "w-6 h-6", size }: IconProps) {
  return (
    <svg {...defaultProps(className, size)}>
      <rect x="2" y="9" width="4" height="6" rx="1" />
      <rect x="18" y="9" width="4" height="6" rx="1" />
      <rect x="5.5" y="11" width="13" height="2" rx="1" />
    </svg>
  );
}

export function MedicalCrossIcon({ className = "w-6 h-6", size }: IconProps) {
  return (
    <svg {...defaultProps(className, size)}>
      <path d="M12 2v20M2 12h20" />
      <circle cx="12" cy="12" r="10" />
    </svg>
  );
}

export function GraduationCapIcon({ className = "w-6 h-6", size }: IconProps) {
  return (
    <svg {...defaultProps(className, size)}>
      <path d="M2 10l10-7 10 7-10 7z" />
      <path d="M6 12v7a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-7" />
    </svg>
  );
}

export function GamepadIcon({ className = "w-6 h-6", size }: IconProps) {
  return (
    <svg {...defaultProps(className, size)}>
      <rect x="2" y="6" width="20" height="12" rx="3" />
      <path d="M6 11h4M8 9v4" />
      <circle cx="16" cy="12" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="19" cy="10" r="1" fill="currentColor" stroke="none" />
      <circle cx="19" cy="14" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function TaxiIcon({ className = "w-6 h-6", size }: IconProps) {
  return (
    <svg {...defaultProps(className, size)}>
      <rect x="1" y="8" width="22" height="12" rx="2" />
      <path d="M16 8V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v3" />
      <circle cx="7" cy="15" r="2" />
      <circle cx="17" cy="15" r="2" />
      <path d="M1 12h22" />
    </svg>
  );
}

export function ClockIcon({ className = "w-6 h-6", size }: IconProps) {
  return (
    <svg {...defaultProps(className, size)}>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </svg>
  );
}
// components/ui/Icons.tsx
// Ajoutez ces fonctions après les autres icônes

// ============================================
// ICÔNES POUR NAVBAR
// ============================================

export function BellIcon({ className = "w-6 h-6", size }: IconProps) {
  return (
    <svg {...defaultProps(className, size)}>
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}

export function BurgerIcon({ open, className = "w-6 h-6", size }: IconProps & { open?: boolean }) {
  return (
    <svg {...defaultProps(className, size)}>
      {open ? (
        <path d="M6 18L18 6M6 6l12 12" />
      ) : (
        <>
          <path d="M4 6h16" />
          <path d="M4 12h16" />
          <path d="M4 18h16" />
        </>
      )}
    </svg>
  );
}
// Ajouter à la fin de Icons.tsx

export function HomeIcon({ className = "w-6 h-6", size }: IconProps) {
  return (
    <svg {...defaultProps(className, size)}>
      <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H14v-6h-4v6H4a1 1 0 0 1-1-1V9.5z" />
    </svg>
  );
}

export function CompassIcon({ className = "w-6 h-6", size }: IconProps) {
  return (
    <svg {...defaultProps(className, size)}>
      <circle cx="12" cy="12" r="10" />
      <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
    </svg>
  );
}

export function InfoIcon({ className = "w-6 h-6", size }: IconProps) {
  return (
    <svg {...defaultProps(className, size)}>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4M12 8h.01" strokeWidth={2.5} />
    </svg>
  );
}

export function HeartIcon({ className = "w-6 h-6", size }: IconProps) {
  return (
    <svg {...defaultProps(className, size)}>
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

export function GridIcon({ className = "w-6 h-6", size }: IconProps) {
  return (
    <svg {...defaultProps(className, size)}>
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  );
}

export function MonitorIcon({ className = "w-6 h-6", size }: IconProps) {
  return (
    <svg {...defaultProps(className, size)}>
      <rect x="2" y="3" width="20" height="14" rx="2" />
      <path d="M8 21h8M12 17v4" />
    </svg>
  );
}

export function FlagIcon({ className = "w-6 h-6", size }: IconProps) {
  return (
    <svg {...defaultProps(className, size)}>
      <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
      <line x1="4" y1="22" x2="4" y2="15" />
    </svg>
  );
}

export function FileTextIcon({ className = "w-6 h-6", size }: IconProps) {
  return (
    <svg {...defaultProps(className, size)}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
    </svg>
  );
}

export function AlertTriangleIcon({ className = "w-6 h-6", size }: IconProps) {
  return (
    <svg {...defaultProps(className, size)}>
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <path d="M12 9v4M12 17h.01" strokeWidth={2.5} />
    </svg>
  );
}
export function TrendingUpIcon({ className = "w-6 h-6", size }: IconProps) {
  return (
    <svg {...defaultProps(className, size)}>
      <path d="M3 17l6-6 4 4 7-7" />
      <path d="M14 4h7v7" />
    </svg>
  );
}
