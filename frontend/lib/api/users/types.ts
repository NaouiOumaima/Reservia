// frontend/lib/api/users/types.ts
export interface User {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'client' | 'provider' | 'admin';
  phone?: string;
  profileImage?: string;
  avatar?: string;
  isBanned?: boolean;
  isEmailVerified?: boolean;
  isActive?: boolean;
  lastLogin?: Date;
  createdAt?: Date;
  preferences?: UserPreferences;
}

export interface UserPreferences {
  favoriteCategories: string[];
  maxPrice?: number;
  maxDistance?: number;
  preferredDays?: string[];
  preferredHours?: string;
}