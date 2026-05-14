export interface Location {
  type: 'Point';
  coordinates: [number, number];
  address: string;
  city: string;
  governorate: string;
  postalCode?: string;
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
  price?: number;
  duration: number;
  images: string[];
  location: Location;
  avgRating: number;
  reviewCount: number;
  rating?: number;
  smartScore: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  _id: string;
  userId: string;
  userName?: string;
  serviceId: string;
  serviceName?: string;
  rating: number;
  comment: string;
  images?: string[];
  response?: string;
  responseDate?: string;
  isApproved: boolean;
  isReported: boolean;
  createdAt: string;
  updatedAt: string;
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