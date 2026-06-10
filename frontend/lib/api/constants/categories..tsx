// components/ui/categories.ts
import React, { JSX } from 'react';
import {
  BedIcon,
  LipstickIcon,
  DumbbellIcon,
  MedicalCrossIcon,
  GraduationCapIcon,
  EntertainmentIcon,
  TransportIcon,
  ServicesIcon,
  RestaurantIcon,
  HotelIcon,
  SpaIcon,
  FitnessIcon,
  HealthIcon,
  EducationIcon,
  GamepadIcon,
  TaxiIcon,
  GridIcon,        // Ajouté pour "Toutes catégories"
  CompassIcon,     // Alternative pour "Toutes"
} from '@/components/ui/Icons';

// Ajoutez une catégorie spéciale "ALL" dans l'enum
export enum CategoryKey {
  ALL = 'all',           // Nouveau
  RESTAURANT = 'restaurant',
  HOTEL = 'hotel',
  BEAUTY = 'beauté',
  FITNESS = 'fitness',
  MEDICAL = 'medical',
  EDUCATION = 'education',
  ENTERTAINMENT = 'loisirs',
  TRANSPORT = 'transport',
  OTHER = 'autre',
}

export interface Category {
  key: CategoryKey;
  label: string;
  frenchLabel: string;
  icon: JSX.Element;
  description: string;
  color?: string;
}

export const CATEGORIES: Category[] = [
  {
    key: CategoryKey.ALL,
    label: 'all',
    frenchLabel: 'Toutes catégories',
    icon: <GridIcon className="w-5 h-5" />,  // Icône grille
    description: 'Tous les services',
    color: '#9CA3AF', // gris
  },
  {
    key: CategoryKey.RESTAURANT,
    label: 'restaurant',
    frenchLabel: 'Restauration',
    icon: <RestaurantIcon className="w-5 h-5" />,
    description: 'Restaurants, cafés et services de restauration',
    color: '#EF4444',
  },
  {
    key: CategoryKey.HOTEL,
    label: 'hotel',
    frenchLabel: 'Hébergement',
    icon: <HotelIcon className="w-5 h-5" />,
    description: 'Hôtels, guesthouses et logements temporaires',
    color: '#3B82F6',
  },
  {
    key: CategoryKey.BEAUTY,
    label: 'beauté',
    frenchLabel: 'Beauté & Bien-être',
    icon: <LipstickIcon className="w-5 h-5" />,
    description: 'Salons de coiffure, spa et services de beauté',
    color: '#EC4899',
  },
  {
    key: CategoryKey.FITNESS,
    label: 'fitness',
    frenchLabel: 'Fitness',
    icon: <FitnessIcon className="w-5 h-5" />,
    description: 'Salles de sport, cours et entraînements',
    color: '#10B981',
  },
  {
    key: CategoryKey.MEDICAL,
    label: 'medical',
    frenchLabel: 'Santé',
    icon: <MedicalCrossIcon className="w-5 h-5" />,
    description: 'Cliniques, pharmacies et services médicaux',
    color: '#8B5CF6',
  },
  {
    key: CategoryKey.EDUCATION,
    label: 'education',
    frenchLabel: 'Éducation',
    icon: <EducationIcon className="w-5 h-5" />,
    description: 'Cours, formation et services éducatifs',
    color: '#F59E0B',
  },
  {
    key: CategoryKey.ENTERTAINMENT,
    label: 'loisirs',
    frenchLabel: 'Loisirs',
    icon: <EntertainmentIcon className="w-5 h-5" />,
    description: 'Cinéma, jeux, loisirs et divertissements',
    color: '#6366F1',
  },
  {
    key: CategoryKey.TRANSPORT,
    label: 'transport',
    frenchLabel: 'Transport',
    icon: <TransportIcon className="w-5 h-5" />,
    description: 'Taxi, transport et services de mobilité',
    color: '#06B6D4',
  },
  {
    key: CategoryKey.OTHER,
    label: 'autre',
    frenchLabel: 'Autre',
    icon: <ServicesIcon className="w-5 h-5" />,
    description: 'Autres types de services',
    color: '#6B7280',
  },
];

// Mettre à jour les maps
export const CATEGORIES_MAP = new Map<string, Category>(
  CATEGORIES.map(cat => [cat.label, cat])
);

export const FRENCH_TO_KEY = new Map<string, CategoryKey>(
  CATEGORIES.map(cat => [cat.frenchLabel, cat.key])
);

export const KEY_TO_CATEGORY = new Map<CategoryKey, Category>(
  CATEGORIES.map(cat => [cat.key, cat])
);

// Fonctions utilitaires mises à jour
export const getCategoryByLabel = (label: string): Category | undefined => {
  return CATEGORIES_MAP.get(label);
};

export const getCategoryByFrenchLabel = (frenchLabel: string): Category | undefined => {
  return CATEGORIES.find(cat => cat.frenchLabel === frenchLabel);
};

export const getCategoryByKey = (key: CategoryKey): Category | undefined => {
  return KEY_TO_CATEGORY.get(key);
};

export const getCategoryIcon = (label: string): JSX.Element | undefined => {
  return getCategoryByLabel(label)?.icon;
};

export const getCategoryIconByKey = (key: CategoryKey): JSX.Element | undefined => {
  return getCategoryByKey(key)?.icon;
};

export const getCategoryFrenchLabel = (label: string): string => {
  const category = getCategoryByLabel(label);
  return category?.frenchLabel || label;
};

export const getCategoryColor = (label: string): string => {
  const category = getCategoryByLabel(label);
  return category?.color || '#9CA3AF';
};

export const getAllCategoryLabels = (): string[] => {
  return CATEGORIES.map(cat => cat.frenchLabel);
};

export const getAllCategoryKeys = (): string[] => {
  return CATEGORIES.map(cat => cat.label);
};

// Composant CategoryIcon
interface CategoryIconProps {
  category: string | CategoryKey;
  className?: string;
  size?: number;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({ category, className = "w-6 h-6", size }) => {
  let cat: Category | undefined;
  
  if (typeof category === 'string') {
    cat = getCategoryByKey(category as CategoryKey) || getCategoryByLabel(category);
  } else {
    cat = getCategoryByKey(category);
  }
  
  if (!cat) {
    return <ServicesIcon className={className} size={size} />;
  }
  
  return React.cloneElement(cat.icon, { className, size });
};