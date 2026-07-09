// lib/api/services/types.ts

export interface Location {
  type: 'Point';
  coordinates: [number, number];
  address: string;
  city: string;
  governorate: string;
  postalCode?: string;
}

export interface AvailabilitySlot {
  day: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

export type ServiceStatus =
  | 'pending_approval'
  | 'active'
  | 'disabled'
  | 'banned';

export interface Service {
  _id: string;
  providerId: string;
  providerName?: string;
  name: string;
  category: string;
  description: string;
  duration: number;
  images: string[];
  location: Location;
  avgRating: number;
  reviewCount: number;
  rating?: number;
  smartScore: number;
  status: ServiceStatus;
  rejectionReason?: string;
  banReason?: string;
  createdAt: string;
  updatedAt: string;
  availabilitySlots?: AvailabilitySlot[];
}

export interface CreateServiceData {
  name: string;
  category: string;
  description: string;
  duration: number;
  images?: string[];
  location: {
    coordinates: [number, number];
    address: string;
    city: string;
    governorate: string;
    postalCode?: string;
  };
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