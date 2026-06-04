// lib/api/services/types.ts

export interface Location {
  type: 'Point';
  coordinates: [number, number];
  address: string;
  city: string;
  governorate: string;
  postalCode?: string;
}

// Ajouter l'interface pour les créneaux de disponibilité
export interface AvailabilitySlot {
  day: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

export interface Service {
  _id: string;
  providerId: string;
  providerName?: string;
  name: string;
  category: string;
  description: string;
  basePrice: number;
  discountPrice?: number;
  duration: number;
  images: string[];
  location: Location;
  avgRating: number;
  reviewCount: number;
  rating?: number;
  smartScore: number;
  isActive: boolean;
  isPendingApproval?: boolean;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
  // ✅ Ajouter cette propriété
  availabilitySlots?: AvailabilitySlot[];
}

export interface CreateServiceData {
  name: string;
  category: string;
  description: string;
  basePrice: number;
  discountPrice?: number;
  duration: number;
  images?: string[];
  location: {
    coordinates: [number, number];
    address: string;
    city: string;
    governorate: string;
    postalCode?: string;
  };
  // ✅ Ajouter cette propriété
  availabilitySlots?: AvailabilitySlot[];
}

export interface UpsertLocationData {
  location: {
    coordinates: {
      lng: number;
      lat: number;
    };
    address: string;
    city: string;
    governorate: string;
    postalCode?: string;
  };
}

export interface ServiceFilters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  limit?: number;
  skip?: number;
}

export interface PaginatedServicesResponse {
  services: Service[];
  total: number;
  page: number;
  totalPages: number;
}