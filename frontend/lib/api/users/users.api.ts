import { apiClient } from '../config';
import { User, UserPreferences } from './types';

export const usersApi = {
  getProfile: async (): Promise<User> => {
    const response = await apiClient.get('/api/users/me');
    return response.data;
  },

  updateProfile: async (data: Partial<User>): Promise<User> => {
    const response = await apiClient.put('/api/users/me', data);
    return response.data;
  },

  updatePreferences: async (preferences: UserPreferences): Promise<User> => {
    const response = await apiClient.put('/api/users/preferences', { preferences });
    return response.data;
  },

  uploadAvatar: async (file: File): Promise<{ avatarUrl: string }> => {
    const formData = new FormData();
    formData.append('avatar', file);
    const response = await apiClient.post('/api/users/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  changePassword: async (oldPassword: string, newPassword: string): Promise<void> => {
    await apiClient.post('/api/users/change-password', { oldPassword, newPassword });
  },
};