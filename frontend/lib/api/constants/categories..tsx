import React, { JSX } from 'react';
import {
  BedIcon,
  PlateEatingIcon,
  LipstickIcon,
  DumbbellIcon,
  MedicalCrossIcon,
  GraduationCapIcon,
  EntertainmentIcon,
  TransportIcon,
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
  icon: JSX.Element;
  description: string;
  color?: string;
}

export const CATEGORIES: Category[] = [
  {
    key: CategoryKey.RESTAURANT,
    label: 'restaurant',
    frenchLabel: 'Restauration',
    icon: <PlateEatingIcon className="w-10 h-10" />,
    description: 'Restaurants, cafés et services de restauration',
  },
  {
    key: CategoryKey.HOTEL,
    label: 'hotel',
    frenchLabel: 'Hébergement',
    icon: <BedIcon className="w-10 h-10" />,
    description: 'Hôtels, guesthouses et logements temporaires',
  },
  {
    key: CategoryKey.BEAUTY,
    label: 'beauté',
    frenchLabel: 'Beauté & Bien-être',
    icon: <LipstickIcon className="w-10 h-10" />,
    description: 'Salons de coiffure, spa et services de beauté',
  },
  {
    key: CategoryKey.FITNESS,
    label: 'fitness',
    frenchLabel: 'Fitness',
    icon: <DumbbellIcon className="w-10 h-10" />,
    description: 'Salles de sport, cours et entraînements',
  },
  {
    key: CategoryKey.MEDICAL,
    label: 'medical',
    frenchLabel: 'Santé',
    icon: <MedicalCrossIcon className="w-10 h-10" />,
    description: 'Cliniques, pharmacies et services médicaux',
  },
  {
    key: CategoryKey.EDUCATION,
    label: 'education',
    frenchLabel: 'Éducation',
    icon: <GraduationCapIcon className="w-10 h-10" />,
    description: 'Cours, formation et services éducatifs',
  },
  {
    key: CategoryKey.ENTERTAINMENT,
    label: 'loisirs',
    frenchLabel: 'Loisirs',
    icon: <EntertainmentIcon className="w-10 h-10" />,
    description: 'Cinéma, jeux, loisirs et divertissements',
  },
  {
    key: CategoryKey.TRANSPORT,
    label: 'transport',
    frenchLabel: 'Transport',
    icon: <TransportIcon className="w-10 h-10" />,
    description: 'Taxi, transport et services de mobilité',
  },
  {
    key: CategoryKey.OTHER,
    label: 'autre',
    frenchLabel: 'Autre',
    icon: <ServicesIcon className="w-10 h-10" />,
    description: 'Autres types de services',
  },
];

export const CATEGORIES_MAP = new Map<string, Category>(
  CATEGORIES.map(cat => [cat.label, cat])
);

export const FRENCH_TO_KEY = new Map<string, CategoryKey>(
  CATEGORIES.map(cat => [cat.frenchLabel, cat.key])
);

export const getCategoryByLabel = (label: string): Category | undefined => {
  return CATEGORIES_MAP.get(label);
};

export const getCategoryByFrenchLabel = (frenchLabel: string): Category | undefined => {
  return CATEGORIES.find(cat => cat.frenchLabel === frenchLabel);
};

export const getCategoryIcon = (label: string): JSX.Element | undefined => {
  return getCategoryByLabel(label)?.icon;
};

export const getCategoryFrenchLabel = (label: string): string => {
  return getCategoryByLabel(label)?.frenchLabel || label;
};

export const getAllCategoryLabels = (): string[] => {
  return CATEGORIES.map(cat => cat.frenchLabel);
};

export const getAllCategoryKeys = (): string[] => {
  return CATEGORIES.map(cat => cat.label);
};