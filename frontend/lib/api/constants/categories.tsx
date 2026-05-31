// lib/api/constants/categories.ts

import React from 'react';
import {
  RestaurantIcon,
  HotelIcon,
  SpaIcon,
  FitnessIcon,
  MedicalCrossIcon,
  GraduationCapIcon,
  GamepadIcon,
  TaxiIcon,
  ServicesIcon,
} from '@/components/ui/Icons';

export enum CategoryKey {
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
  IconComponent: React.ComponentType<{ className?: string; size?: number }>;
  description: string;
  color: string;
  bgColor: string;
}

export const CATEGORIES: Category[] = [
  {
    key: CategoryKey.RESTAURANT,
    label: 'restaurant',
    frenchLabel: 'Restauration',
    IconComponent: RestaurantIcon,
    description: 'Restaurants, cafés et services de restauration',
    color: '#EF4444',
    bgColor: 'bg-red-50',
  },
  {
    key: CategoryKey.HOTEL,
    label: 'hotel',
    frenchLabel: 'Hébergement',
    IconComponent: HotelIcon,
    description: 'Hôtels, guesthouses et logements temporaires',
    color: '#10B981',
    bgColor: 'bg-emerald-50',
  },
  {
    key: CategoryKey.BEAUTY,
    label: 'beauté',
    frenchLabel: 'Beauté & Bien-être',
    IconComponent: SpaIcon,
    description: 'Salons de coiffure, spa et services de beauté',
    color: '#EC4899',
    bgColor: 'bg-pink-50',
  },
  {
    key: CategoryKey.FITNESS,
    label: 'fitness',
    frenchLabel: 'Fitness & Sport',
    IconComponent: FitnessIcon,
    description: 'Salles de sport, cours et entraînements',
    color: '#22C55E',
    bgColor: 'bg-green-50',
  },
  {
    key: CategoryKey.MEDICAL,
    label: 'medical',
    frenchLabel: 'Santé',
    IconComponent: MedicalCrossIcon,
    description: 'Cliniques, pharmacies et services médicaux',
    color: '#F97316',
    bgColor: 'bg-orange-50',
  },
  {
    key: CategoryKey.EDUCATION,
    label: 'education',
    frenchLabel: 'Éducation',
    IconComponent: GraduationCapIcon,
    description: 'Cours, formation et services éducatifs',
    color: '#3B82F6',
    bgColor: 'bg-blue-50',
  },
  {
    key: CategoryKey.ENTERTAINMENT,
    label: 'loisirs',
    frenchLabel: 'Loisirs',
    IconComponent: GamepadIcon,
    description: 'Cinéma, jeux, loisirs et divertissements',
    color: '#8B5CF6',
    bgColor: 'bg-purple-50',
  },
  {
    key: CategoryKey.TRANSPORT,
    label: 'transport',
    frenchLabel: 'Transport',
    IconComponent: TaxiIcon,
    description: 'Taxi, transport et services de mobilité',
    color: '#F59E0B',
    bgColor: 'bg-amber-50',
  },
  {
    key: CategoryKey.OTHER,
    label: 'autre',
    frenchLabel: 'Autre',
    IconComponent: ServicesIcon,
    description: 'Autres types de services',
    color: '#6B7280',
    bgColor: 'bg-gray-50',
  },
];

export const CATEGORIES_MAP = new Map<string, Category>(
  CATEGORIES.map((cat) => [cat.label, cat])
);

export const getCategoryByLabel = (label: string): Category | undefined => 
  CATEGORIES_MAP.get(label);

export const getCategoryFrenchLabel = (label: string): string =>
  getCategoryByLabel(label)?.frenchLabel ?? label;

export const getCategoryColor = (label: string): string =>
  getCategoryByLabel(label)?.color ?? '#6B7280';

export const getCategoryBgColor = (label: string): string =>
  getCategoryByLabel(label)?.bgColor ?? 'bg-gray-50';

export const renderCategoryIcon = (label: string, className = "w-12 h-12"): React.ReactNode => {
  const category = getCategoryByLabel(label);
  if (!category) return null;
  return <category.IconComponent className={className} />;
};

export const getCategoryIconComponent = (label: string) => {
  return getCategoryByLabel(label)?.IconComponent;
};
export const getCategoryByKey = (key: string): Category | undefined => {
  return CATEGORIES.find((cat: Category) => cat.key === key);
};