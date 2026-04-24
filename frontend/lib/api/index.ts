// frontend/lib/api/index.ts

// Configuration
export { apiClient, API_URL } from './config';

// Auth APIs
export { login, logout, getCurrentUser, isAuthenticated } from './auth/login';
export type { LoginCredentials, User, LoginResponse } from './auth/login';

export { register } from './auth/register';
export type { RegisterData } from './auth/register';