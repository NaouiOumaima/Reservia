// types/index.ts

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

  preferences?: UserPreferences;

  createdAt: Date;
  updatedAt: Date;
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
  discountPrice?: number;

  duration: number;

  images: string[];

  location: Location;

  rating: number;
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
   CHAT (OPTIONAL)
========================= */
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

/* =========================
   WINDOW EXTENSION (VOICE)
========================= */
export interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

export interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

export interface SpeechRecognitionResult {
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
  isFinal: boolean;
}

export interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

export interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

export interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;

  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  onstart: (() => void) | null;

  start(): void;
  stop(): void;
  abort(): void;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}