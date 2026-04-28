// types/index.ts
export interface Service {
  _id: string;
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
  smartScore: number;
  isActive: boolean;
  providerId: string;
  providerName?: string;
  createdAt: Date;
  updatedAt: Date;
  price?: number;      // alias pour basePrice (compatibilité)
  rating?: number;     // alias pour avgRating (compatibilité)
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
  responseDate?: Date;
  isApproved: boolean;
  isReported: boolean;
  createdAt: Date;
  updatedAt: Date;
}