// frontend/lib/api/users/types.ts

export interface UserLocation {
  type: string;
  coordinates: [number, number];
  address: string;
  city: string;
  governorate: string;
  postalCode?: string;
}

export interface ProviderSettings {
  slotDuration: number;
  cancellationDeadline: number;
  maxAdvanceBooking: number;
  prepareTime: number;
}

export interface ProviderProfile {
  businessName: string;
  siret?: string;
  description: string;
  images: string[];
  openingHours: Record<string, any>;
  settings: ProviderSettings;
  isVerified: boolean;
}

export interface UserPreferences {
  favoriteCategories: string[];
  maxPrice?: number;
  maxDistance?: number;
  preferredDays?: string[];
  preferredHours?: string;
}

// ✅ UpdateProfileData - SANS EMAIL
export interface UpdateProfileData {
  firstName?: string;
  lastName?: string;
  phone?: string;
  bio?: string;
  profileImage?: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface User {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'client' | 'provider' | 'admin';
  phone?: string;
  bio?: string;
  profileImage?: string;
  avatar?: string;
  isBanned?: boolean;
  isEmailVerified?: boolean;
  isActive?: boolean;
  lastLogin?: Date;
  createdAt?: Date;
  providerStatus?: string;
  googleId?: string | null;
  picture?: string | null;
  preferences?: UserPreferences;
  providerProfile?: ProviderProfile;
  location?: UserLocation;
}