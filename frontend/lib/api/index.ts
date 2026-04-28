// Configuration
export { apiClient, API_URL } from './config';

// Auth
export * from './auth';

// Services
export { servicesApi } from './services';
export type { CreateServiceData, ServiceFilters } from './services';

// Reservations
export { reservationsApi } from './reservations';
export type { CreateReservationData } from './reservations';

// Reviews
export { reviewsApi } from './reviews';
export type { CreateReviewData } from './reviews';

// Users
export { usersApi, favoritesApi } from './users';

// Chatbot
export * from './chatbot';

// Constants
export { TUNISIAN_GOVERNORATES } from './constants/governorates';
export type { Governorate } from './constants/governorates';

// Types (ré-exporter depuis /types pour commodité)
export type {
  User,
  UserRole,
  UserPreferences,
  Location,
  Service,
  Reservation,
  Review,
  Notification,
  SearchFilters,
  DashboardStats,
  TrendData,
  PopularSlot,
  AuthResponse,
  ChatMessage,
} from '@/types';