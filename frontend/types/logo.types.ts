export interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'compact' | 'full';

  className?: string;

  // Navigation / interaction
  onClick?: () => void;
  href?: string;

  // Accessibilité (important en production)
  ariaLabel?: string;

  // UI behavior
  showTagline?: boolean;
  animated?: boolean;
}