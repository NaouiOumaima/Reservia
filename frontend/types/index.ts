// frontend/types/index.ts

export type UserRole = 'client' | 'provider' | 'admin';

/* =========================
   USER
========================= */

export interface User {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  phone?: string;
  avatar?: string;
  profileImage?: string;
  preferences?: UserPreferences;
  isBanned?: boolean;
  isEmailVerified?: boolean;
  isActive?: boolean;
  lastLogin?: Date;

  createdAt?: Date;
  updatedAt?: Date;
}

export interface UserPreferences {
  favoriteCategories: string[];
  maxPrice?: number;
  maxDistance?: number;
  preferredDays?: string[];
  preferredHours?: string;
}

/* =========================
   LOCATION
========================= */
export interface Location {
  type: 'Point';
  coordinates: [number, number];
  address: string;
  city: string;
  governorate: string;
  postalCode?: string;
}

/* =========================
   SERVICE
========================= */
export interface Service {
  _id: string;
  providerId: string;
  providerName?: string;
  name: string;
  category: string;
  description: string;
  price: number;
  basePrice: number;
  discountPrice?: number;
  duration: number;
  images: string[];
  location: Location;
  rating: number;
  avgRating: number;
  reviewCount: number;
  smartScore: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/* =========================
   RESERVATION
========================= */
export interface Reservation {
  _id: string;
  userId: string;
  serviceId: string;
  serviceName?: string;
  providerName?: string;
  date?: Date;
  startTime: string;
  endTime: string;
  duration: number;
  price: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'expired';
  customerInfo?: {
    name: string;
    email: string;
    phone: string;
  };
  specialRequests?: string;
  createdAt: Date;
  expiresAt?: Date;
  cancelledAt?: Date;
  cancellationReason?: string;
}

/* =========================
   REVIEW
========================= */
export interface Review {
  _id: string;
  userId: string;
  userName?: string;
  serviceId: string;
  serviceName?: string;
  rating: number;
  comment: string;
  images?: string[];
  isApproved: boolean;
  isReported: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/* =========================
   NOTIFICATION
========================= */
export interface Notification {
  _id: string;
  userId: string;
  type: 'reservation_confirmed' | 'reservation_reminder' | 'reservation_cancelled' | 'reservation_expired' | 'promotion' | 'system';
  title: string;
  message: string;
  data?: any;
  isRead: boolean;
  createdAt: Date;
}

/* =========================
   SEARCH
========================= */
export interface SearchFilters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  sortBy?: 'smart' | 'price' | 'rating' | 'distance';
  location?: {
    lng: number;
    lat: number;
    radius?: number;
  };
}

/* =========================
   DASHBOARD
========================= */
export interface DashboardStats {
  totalReservations: number;
  completedReservations: number;
  cancelledReservations: number;
  revenue: number;
  averageRating: number;
  reservationTrend: TrendData[];
  revenueTrend: TrendData[];
  popularSlots: PopularSlot[];
  recentReservations: Reservation[];
}

export interface TrendData {
  date: string;
  value: number;
}

export interface PopularSlot {
  hour: number;
  count: number;
}

/* =========================
   AUTH
========================= */
export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

/* =========================
   CHAT
========================= */
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}