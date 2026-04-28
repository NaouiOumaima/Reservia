export interface User {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'client' | 'provider' | 'admin';
  phone?: string;
  avatar?: string;
  preferences?: UserPreferences;
  createdAt: Date;
}

export interface UserPreferences {
  favoriteCategories: string[];
  maxPrice?: number;
  maxDistance?: number;
  preferredDays?: string[];
  preferredHours?: string;
}