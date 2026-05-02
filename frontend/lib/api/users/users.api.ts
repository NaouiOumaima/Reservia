// frontend/lib/api/users.api.ts
import { apiClient } from '../config';
import { User, UserPreferences } from './types';  // Import depuis users/types

export const usersApi = {
  // Profile endpoints
  getProfile: async (): Promise<User> => {
    const response = await apiClient.get('/users/me');
    return response.data;
  },

  updateProfile: async (data: Partial<User>): Promise<User> => {
    const response = await apiClient.put('/users/me', data);
    return response.data;
  },

  updatePreferences: async (preferences: UserPreferences): Promise<User> => {
    const response = await apiClient.put('/users/preferences', { preferences });
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

  changePassword: async (oldPassword: string, newPassword: string): Promise<void> => {
    await apiClient.post('/users/change-password', { oldPassword, newPassword });
  },

  // Admin endpoints
  getAllUsers: async (role?: string): Promise<User[]> => {
    try {
      const params = role ? { role } : {};
      const response = await apiClient.get('/users', { params });
      return response.data;
    } catch (error) {
      console.error('Error in getAllUsers:', error);
      throw error;
    }
  },

  getUserStats: async (): Promise<{ total: number; clients: number; providers: number; admins: number }> => {
    const response = await apiClient.get('/users/stats');
    return response.data;
  },

  updateUserRole: async (userId: string, newRole: string): Promise<User> => {
    const response = await apiClient.patch(`/users/${userId}/role`, { role: newRole });
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