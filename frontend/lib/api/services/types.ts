// lib/api/services/types.ts

import { CategoryKey } from "../constants/categories";

export interface LocationCoordinates {
  lng: number;
  lat: number;
}

// Format frontend pour les formulaires
export interface Location {
  coordinates: LocationCoordinates;
  address: string;
  city: string;
  governorate: string;
  postalCode?: string;
}

// Format backend pour l'API
export interface BackendLocation {
  type: 'Point';
  coordinates: [number, number];
  address: string;
  city: string;
  governorate: string;
  postalCode?: string;
}

export interface OpeningHoursSlot {
  open: string;
  close: string;
}

export interface ServiceSlot {
  day: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

export interface CancellationPolicy {
  minHoursBefore: number;
  refundPercentage: number;
}

export interface Service {
  _id: string;
  name: string;
  description: string;
  category: CategoryKey;
  images?: string[];
  location: BackendLocation;
  openingHours?: {
    [key: string]: OpeningHoursSlot;
  };
  slots?: ServiceSlot[];
  cancellationPolicy?: CancellationPolicy;
  providerId: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    providerProfile?: {
      businessName: string;
    };
  };
  isActive: boolean;
  isPendingApproval: boolean;
  duration: number;
  avgRating: number;
  reviewCount: number;
  popularity: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateServiceData {
  name: string;
  description: string;
  category: CategoryKey;
  images?: string[];
  location: Location;  // Format frontend pour la création
  openingHours?: {
    [key: string]: OpeningHoursSlot;
  };
  slots?: ServiceSlot[];
  cancellationPolicy?: CancellationPolicy;
  duration?: number;
}

export interface UpdateServiceData {
  name?: string;
  description?: string;
  category?: CategoryKey;
  images?: string[];
  location?: BackendLocation;  // Format backend pour la mise à jour
  slots?: ServiceSlot[];
  duration?: number;
}

export interface ServiceFilters {
  category?: CategoryKey;
  minRating?: number;
  limit?: number;
  skip?: number;
}

export interface UpsertLocationData {
  location: Location;
}

// Fonction utilitaire pour convertir backend -> frontend
export const toFrontendLocation = (backendLocation: BackendLocation): Location => {
  return {
    coordinates: {
      lng: backendLocation.coordinates[0],
      lat: backendLocation.coordinates[1],
    },
    address: backendLocation.address,
    city: backendLocation.city,
    governorate: backendLocation.governorate,
    postalCode: backendLocation.postalCode,
  };
};

// Fonction utilitaire pour convertir frontend -> backend
export const toBackendLocation = (location: Location): BackendLocation => {
  return {
    type: 'Point',
    coordinates: [location.coordinates.lng, location.coordinates.lat],
    address: location.address,
    city: location.city,
    governorate: location.governorate,
    postalCode: location.postalCode,
  };
};
// lib/api/services/types.ts

// Gardez ce type pour le frontend
export interface ServiceSlot {
  day: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

// Ajoutez ce type pour le backend
export interface BackendServiceSlot {
  duration: number;
  maxReservationsPerSlot: number;
}