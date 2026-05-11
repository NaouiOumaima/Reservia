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
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="M17 17l3 3" />
    </svg>
  );
}

export function MapIcon({ className = "w-6 h-6", size }: IconProps) {
  return (
    <svg {...defaultProps(className, size)}>
      <path d="M12 2C8.686 2 6 4.686 6 8c0 5.25 6 13 6 13s6-7.75 6-13c0-3.314-2.686-6-6-6z" />
      <circle cx="12" cy="8" r="2" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function AiIcon({ className = "w-6 h-6", size }: IconProps) {
  return (
    <svg {...defaultProps(className, size)}>
      <rect x="6" y="8" width="12" height="13" rx="3" />
      <path d="M10 8V6a2 2 0 0 1 4 0v2" />
      <circle cx="12" cy="14" r="1.5" fill="currentColor" stroke="none" />
      <path d="M12 15.5v2" />
    </svg>
  );
}

export function BookingIcon({ className = "w-6 h-6", size }: IconProps) {
  return (
    <svg {...defaultProps(className, size)}>
      <rect x="3" y="5" width="18" height="16" rx="3" />
      <path d="M3 10h18" />
      <path d="M8 3v4M16 3v4" />
      <path d="M8 14h2M8 17.5h5" />
      <path d="M14.5 13.5l1.5 1.5 2.5-2.5" />
    </svg>
  );
}

export function ReviewIcon({ className = "w-6 h-6", size }: IconProps) {
  return (
    <svg {...defaultProps(className, size)}>
      <path d="M12 2l2.6 5.3 5.9.85-4.25 4.14 1 5.88L12 15.4l-5.25 2.77 1-5.88L3.5 8.18l5.9-.85L12 2z" />
    </svg>
  );
}

export function NotificationIcon({ className = "w-6 h-6", size }: IconProps) {
  return (
    <svg {...defaultProps(className, size)}>
      <path d="M5.5 9a6.5 6.5 0 0 1 13 0c0 3.5 1.5 5.5 2.5 6.5H3C4 14.5 5.5 12.5 5.5 9z" />
      <path d="M10 21a2 2 0 0 0 4 0" />
      <circle cx="18.5" cy="4.5" r="2.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

// ============================================
// ICÔNES POUR CATÉGORIES
// ============================================

export function AllCategoriesIcon({ className = "w-6 h-6", size }: IconProps) {
  return (
    <svg {...defaultProps(className, size)}>
      <rect x="3" y="3" width="7" height="7" rx="2" />
      <rect x="14" y="3" width="7" height="7" rx="2" />
      <rect x="3" y="14" width="7" height="7" rx="2" />
      <rect x="14" y="14" width="7" height="7" rx="2" />
    </svg>
  );
}

export function RestaurantIcon({ className = "w-6 h-6", size }: IconProps) {
  return (
    <svg {...defaultProps(className, size)}>
      <path d="M3 21h18M5 21V10l7-7 7 7v11" />
      <path d="M10 21v-5h4v5" />
    </svg>
  );
}

export function HotelIcon({ className = "w-6 h-6", size }: IconProps) {
  return (
    <svg {...defaultProps(className, size)}>
      <rect x="2" y="12" width="20" height="9" rx="2" />
      <path d="M4 12V9a8 8 0 0 1 16 0v3" />
      <path d="M10 16h4M8 12v-1M16 12v-1" />
    </svg>
  );
}

export function SpaIcon({ className = "w-6 h-6", size }: IconProps) {
  return (
    <svg {...defaultProps(className, size)}>
      <path d="M12 22C7 22 3 17.5 3 13a9 9 0 0 1 18 0c0 4.5-4 9-9 9z" />
      <path d="M7.5 13c.8-3 2.5-4.5 4.5-4.5s3.7 1.5 4.5 4.5" />
      <circle cx="12" cy="8" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function FitnessIcon({ className = "w-6 h-6", size }: IconProps) {
  return (
    <svg {...defaultProps(className, size)}>
      <rect x="3" y="10" width="4" height="4" rx="1.5" />
      <rect x="17" y="10" width="4" height="4" rx="1.5" />
      <path d="M7 12h10" />
      <path d="M1 9v6M23 9v6" strokeWidth={2.5} />
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
      <path d="M22 10L12 4 2 10l10 6z" />
      <path d="M7 12.5v6.5a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-6.5" />
    </svg>
  );
}

export function EntertainmentIcon({ className = "w-6 h-6", size }: IconProps) {
  return (
    <svg {...defaultProps(className, size)}>
      <rect x="2" y="5" width="20" height="15" rx="3" />
      <path d="M10 9.5l5.5 3-5.5 3V9.5z" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function TransportIcon({ className = "w-6 h-6", size }: IconProps) {
  return (
    <svg {...defaultProps(className, size)}>
      <rect x="2" y="9" width="20" height="11" rx="2.5" />
      <path d="M7 9V7a5 5 0 0 1 10 0v2" />
      <circle cx="7.5" cy="15" r="2" />
      <circle cx="16.5" cy="15" r="2" />
      <path d="M2 13h20" />
    </svg>
  );
}

// ============================================
// ICÔNES POUR STATS & ACTIONS
// ============================================

export function UsersIcon({ className = "w-6 h-6", size }: IconProps) {
  return (
    <svg {...defaultProps(className, size)}>
      <circle cx="9" cy="7" r="4" />
      <path d="M2 21v-1a7 7 0 0 1 7-7h0" />
      <path d="M16 21v-1a5 5 0 0 0-5-5" />
      <path d="M19 12v6M22 15h-6" />
    </svg>
  );
}

export function ServicesIcon({ className = "w-6 h-6", size }: IconProps) {
  return (
    <svg {...defaultProps(className, size)}>
      <rect x="2" y="3" width="20" height="18" rx="3" />
      <path d="M2 8h20" />
      <path d="M8 13h8M8 17h5" />
    </svg>
  );
}

export function LocationIcon({ className = "w-6 h-6", size }: IconProps) {
  return (
    <svg {...defaultProps(className, size)}>
      <path d="M12 2C8.686 2 6 4.686 6 8c0 5.25 6 13 6 13s6-7.75 6-13c0-3.314-2.686-6-6-6z" />
      <circle cx="12" cy="8" r="2" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function StarIcon({ className = "w-6 h-6", size }: IconProps) {
  return (
    <svg {...defaultProps(className, size)}>
      <path d="M12 2l2.6 5.3 5.9.85-4.25 4.14 1 5.88L12 15.4l-5.25 2.77 1-5.88L3.5 8.18l5.9-.85L12 2z" />
    </svg>
  );
}

// ============================================
// ICÔNES POUR NAVIGATION
// ============================================

export function MenuIcon({ className = "w-6 h-6", size }: IconProps) {
  return (
    <svg {...defaultProps(className, size)}>
      <path d="M4 6h16M4 12h11M4 18h14" />
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
      <path d="M4 4h5l10.5 16H14.5z" />
      <path d="M4 20l6.5-6.5M13.5 10.5L20 4" />
    </svg>
  );
}

export function LinkedinIcon({ className = "w-6 h-6", size }: IconProps) {
  return (
    <svg {...defaultProps(className, size)}>
      <rect x="2" y="9" width="4" height="12" rx="1" />
      <circle cx="4" cy="5" r="2" />
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4V9h4v1.5" />
    </svg>
  );
}

export function InstagramIcon({ className = "w-6 h-6", size }: IconProps) {
  return (
    <svg {...defaultProps(className, size)}>
      <rect x="2" y="2" width="20" height="20" rx="6" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1.2" fill="currentColor" stroke="none" />
    </svg>
  );
}

// ============================================
// ICÔNES POUR PAGE À PROPOS
// ============================================

export function CalendarIcon({ className = "w-6 h-6", size }: IconProps) {
  return (
    <svg {...defaultProps(className, size)}>
      <rect x="3" y="5" width="18" height="16" rx="3" />
      <path d="M3 10h18" />
      <path d="M8 3v4M16 3v4" />
      <path d="M8 14h2M8 17.5h5" />
      <path d="M14.5 13.5l1.5 1.5 2.5-2.5" />
    </svg>
  );
}

export function TargetIcon({ className = "w-6 h-6", size }: IconProps) {
  return (
    <svg {...defaultProps(className, size)}>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none" />
      <path d="M12 3v2M12 19v2M3 12h2M19 12h2" />
    </svg>
  );
}

export function ShieldIcon({ className = "w-6 h-6", size }: IconProps) {
  return (
    <svg {...defaultProps(className, size)}>
      <path d="M12 2l7 4v5c0 5.5-3.5 9.5-7 10.8C8.5 20.5 5 16.5 5 11V6l7-4z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  );
}

export function HeadphonesIcon({ className = "w-6 h-6", size }: IconProps) {
  return (
    <svg {...defaultProps(className, size)}>
      <path d="M3 17v-3a9 9 0 0 1 18 0v3" />
      <rect x="2" y="16" width="4" height="5" rx="2" />
      <rect x="18" y="16" width="4" height="5" rx="2" />
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
      <path d="M12 2C8.686 2 6 4.686 6 8c0 5.25 6 13 6 13s6-7.75 6-13c0-3.314-2.686-6-6-6z" />
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
      <rect x="2" y="12" width="20" height="9" rx="2" />
      <path d="M4 12V9a8 8 0 0 1 16 0v3" />
      <path d="M10 16h4M8 12v-1M16 12v-1" />
    </svg>
  );
}

export function DumbbellIcon({ className = "w-6 h-6", size }: IconProps) {
  return (
    <svg {...defaultProps(className, size)}>
      <rect x="3" y="10" width="4" height="4" rx="1.5" />
      <rect x="17" y="10" width="4" height="4" rx="1.5" />
      <path d="M7 12h10" />
      <path d="M1 9v6M23 9v6" strokeWidth={2.5} />
    </svg>
  );
}

export function MedicalCrossIcon({ className = "w-6 h-6", size }: IconProps) {
  return (
    <svg {...defaultProps(className, size)}>
      <rect x="8" y="2" width="8" height="20" rx="2" />
      <rect x="2" y="8" width="20" height="8" rx="2" />
    </svg>
  );
}

export function GraduationCapIcon({ className = "w-6 h-6", size }: IconProps) {
  return (
    <svg {...defaultProps(className, size)}>
      <path d="M22 10L12 4 2 10l10 6z" />
      <path d="M7 12.5v6.5a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-6.5" />
    </svg>
  );
}

export function GamepadIcon({ className = "w-6 h-6", size }: IconProps) {
  return (
    <svg {...defaultProps(className, size)}>
      <rect x="2" y="6" width="20" height="12" rx="3.5" />
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
      <rect x="2" y="9" width="20" height="11" rx="2.5" />
      <path d="M7 9V7a5 5 0 0 1 10 0v2" />
      <circle cx="7.5" cy="15" r="2" />
      <circle cx="16.5" cy="15" r="2" />
      <path d="M2 13h20" />
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

// ============================================
// ICÔNES POUR NAVBAR
// ============================================

export function BellIcon({ className = "w-6 h-6", size }: IconProps) {
  return (
    <svg {...defaultProps(className, size)}>
      <path d="M5.5 9a6.5 6.5 0 0 1 13 0c0 3.5 1.5 5.5 2.5 6.5H3C4 14.5 5.5 12.5 5.5 9z" />
      <path d="M10 21a2 2 0 0 0 4 0" />
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
          <path d="M4 12h11" />
          <path d="M4 18h14" />
        </>
      )}
    </svg>
  );
}

export function HomeIcon({ className = "w-6 h-6", size }: IconProps) {
  return (
    <svg {...defaultProps(className, size)}>
      <path d="M3 10L12 3l9 7v10a1.5 1.5 0 0 1-1.5 1.5H15v-6H9v6H4.5A1.5 1.5 0 0 1 3 20V10z" />
    </svg>
  );
}

export function CompassIcon({ className = "w-6 h-6", size }: IconProps) {
  return (
    <svg {...defaultProps(className, size)}>
      <circle cx="12" cy="12" r="10" />
      <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function InfoIcon({ className = "w-6 h-6", size }: IconProps) {
  return (
    <svg {...defaultProps(className, size)}>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4M12 8h.01" strokeWidth={2.25} />
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
      <rect x="3" y="3" width="7" height="7" rx="2" />
      <rect x="14" y="3" width="7" height="7" rx="2" />
      <rect x="3" y="14" width="7" height="7" rx="2" />
      <rect x="14" y="14" width="7" height="7" rx="2" />
    </svg>
  );
}

export function MonitorIcon({ className = "w-6 h-6", size }: IconProps) {
  return (
    <svg {...defaultProps(className, size)}>
      <rect x="2" y="3" width="20" height="14" rx="2.5" />
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
      <path d="M12 9v4M12 17h.01" strokeWidth={2.25} />
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

// ============================================
// ICÔNES ADMIN — GESTION UTILISATEURS
// ============================================



/** Cercle barré — bannir un utilisateur */
export function BanIcon({ className = "w-6 h-6", size }: IconProps) {
  return (
    <svg {...defaultProps(className, size)}>
      <circle cx="12" cy="12" r="10" />
      <path d="M4.93 4.93l14.14 14.14" />
    </svg>
  );
}

/** Cercle avec coche — réactiver / débannir un utilisateur */
export function CheckCircleIcon({ className = "w-6 h-6", size }: IconProps) {
  return (
    <svg {...defaultProps(className, size)}>
      <circle cx="12" cy="12" r="10" />
      <path d="M8 12l3 3 5-5" />
    </svg>
  );
}

/** X dans un cercle — fermer une fenêtre / modal */
export function XMarkIcon({ className = "w-6 h-6", size }: IconProps) {
  return (
    <svg {...defaultProps(className, size)}>
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  );
}

/** Silhouette utilisateur */
export function UserIcon({ className = "w-6 h-6", size }: IconProps) {
  return (
    <svg {...defaultProps(className, size)}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
    </svg>
  );
}

/** Téléphone */
export function PhoneIcon({ className = "w-6 h-6", size }: IconProps) {
  return (
    <svg {...defaultProps(className, size)}>
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.07 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3 1.18h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.09 8.91a16 16 0 0 0 8 8l1.09-1.09a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 17v-.08z" />
    </svg>
  );
}

/** Enveloppe — email */
export function EnvelopeIcon({ className = "w-6 h-6", size }: IconProps) {
  return (
    <svg {...defaultProps(className, size)}>
      <rect x="2" y="4" width="20" height="16" rx="3" />
      <path d="M2 7l10 7 10-7" />
    </svg>
  );
}

/** Épingle de carte — localisation */
export function MapPinIcon({ className = "w-6 h-6", size }: IconProps) {
  return (
    <svg {...defaultProps(className, size)}>
      <path d="M12 2C8.686 2 6 4.686 6 8c0 5.25 6 13 6 13s6-7.75 6-13c0-3.314-2.686-6-6-6z" />
      <circle cx="12" cy="8" r="2.5" />
    </svg>
  );
}

/** Bâtiment / entreprise — profil fournisseur */
export function BuildingOfficeIcon({ className = "w-6 h-6", size }: IconProps) {
  return (
    <svg {...defaultProps(className, size)}>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M3 9h18" />
      <path d="M9 21V9" />
      <path d="M7 13h2M7 17h2M13 13h2M13 17h2" />
    </svg>
  );
}

/** Bouclier avec coche — vérifié / sécurité */
export function ShieldCheckIcon({ className = "w-6 h-6", size }: IconProps) {
  return (
    <svg {...defaultProps(className, size)}>
      <path d="M12 2l7 4v5c0 5.5-3.5 9.5-7 10.8C8.5 20.5 5 16.5 5 11V6l7-4z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  );
}
/** Corbeille — supprimer un élément (version plus détaillée) */
export function TrashIcon({ className = "w-6 h-6", size }: IconProps) {
  return (
    <svg {...defaultProps(className, size)}>
      <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <path d="M10 11v6M14 11v6" />
      <rect x="5" y="6" width="14" height="16" rx="1.5" />
    </svg>
  );
}
// ============================================
// ICÔNES SUPPLÉMENTAIRES POUR PROFIL ADMIN
// ============================================

/** Appareil photo — changer l'avatar */
export function CameraIcon({ className = "w-6 h-6", size }: IconProps) {
  return (
    <svg {...defaultProps(className, size)}>
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  );
}

/** Cadenas — sécurité / mot de passe */
export function LockIcon({ className = "w-6 h-6", size }: IconProps) {
  return (
    <svg {...defaultProps(className, size)}>
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

/** Œil ouvert — afficher le mot de passe */
export function EyeIcon({ className = "w-6 h-6", size }: IconProps) {
  return (
    <svg {...defaultProps(className, size)}>
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

/** Œil barré — masquer le mot de passe */
export function EyeSlashIcon({ className = "w-6 h-6", size }: IconProps) {
  return (
    <svg {...defaultProps(className, size)}>
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

/** Crayon — modifier / éditer */
export function PencilIcon({ className = "w-6 h-6", size }: IconProps) {
  return (
    <svg {...defaultProps(className, size)}>
      <path d="M17 3l4 4-7 7H10v-4l7-7z" />
      <path d="M4 20l3-3 4 4-3 3z" />
      <path d="M21 21h-8" />
    </svg>
  );
}

/** Disquette — sauvegarder / enregistrer */
export function SaveIcon({ className = "w-6 h-6", size }: IconProps) {
  return (
    <svg {...defaultProps(className, size)}>
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
      <polyline points="17 21 17 13 7 13 7 21" />
      <polyline points="7 3 7 8 15 8" />
    </svg>
  );
}
// ============================================
// ICÔNES SUPPLÉMENTAIRES
// ============================================

/** Mallette / Briefcase — pour les prestataires */
export function BriefcaseIcon({ className = "w-6 h-6", size }: IconProps) {
  return (
    <svg {...defaultProps(className, size)}>
      <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>
  );
}

/** Œil (version admin) — pour voir les détails d'un utilisateur */
export function ViewIcon({ className = "w-6 h-6", size }: IconProps) {
  return (
    <svg {...defaultProps(className, size)}>
      <path d="M1 12S5 4 12 4s11 8 11 8-4 8-11 8S1 12 1 12z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}
// ============================================
// ICÔNES SUPPLÉMENTAIRES
// ============================================

/** Icône de chargement / spinner */
export function Loader2Icon({ className = "w-6 h-6", size }: IconProps) {
  return (
    <svg
      {...defaultProps(className, size)}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
} 
// Ajoutez cette fonction dans votre fichier Icons.tsx
export function SettingsIcon({ className = "w-6 h-6", size }: IconProps) {
  return (
    <svg {...defaultProps(className, size)}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}


