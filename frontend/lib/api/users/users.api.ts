// frontend/lib/api/users/users.api.ts
import { apiClient } from '../config';
import { ChangePasswordData, UpdateProfileData, User, UserPreferences } from './types';

export const usersApi = {
  // ── Profile ─────────────────────────────────────────────────────────────
  getProfile: async (): Promise<User> => {
    const response = await apiClient.get('/users/me');
    return response.data;
  },

  updateProfile: async (data: UpdateProfileData): Promise<User> => {
    const response = await apiClient.put('/users/me', data);
    return response.data;
  },

  updatePreferences: async (preferences: UserPreferences): Promise<User> => {
    const response = await apiClient.put('/users/preferences', { preferences });
    return response.data;
  },

  changePassword: async (data: ChangePasswordData): Promise<{ message: string }> => {
    const response = await apiClient.patch('/users/me/change-password', data);
    return response.data;
  },

  uploadAvatar: async (file: File): Promise<{ avatarUrl: string }> => {
    const formData = new FormData();
    formData.append('avatar', file);
    const response = await apiClient.post('/users/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  // ── Admin ────────────────────────────────────────────────────────────────
  getAllUsers: async (role?: string): Promise<User[]> => {
    const params = role ? { role } : {};
    const response = await apiClient.get('/users', { params });
    return response.data;
  },

  getUserById: async (userId: string): Promise<User> => {
    const response = await apiClient.get(`/users/${userId}`);
    return response.data;
  },

  getUserStats: async (): Promise<{
    total: number;
    clients: number;
    providers: number;
    admins: number;
  }> => {
    const response = await apiClient.get('/users/stats');
    return response.data;
  },

  updateUserRole: async (userId: string, newRole: string): Promise<User> => {
    const response = await apiClient.patch(`/users/${userId}/role`, {
      role: newRole,
    });
    return response.data;
  },

  banUser: async (userId: string): Promise<User> => {
    const response = await apiClient.patch(`/users/${userId}/ban`);
    return response.data;
  },

  unbanUser: async (userId: string): Promise<User> => {
    const response = await apiClient.patch(`/users/${userId}/unban`);
    return response.data;
  },
};