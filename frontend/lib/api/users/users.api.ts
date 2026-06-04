// frontend/lib/api/users/users.api.ts
import { apiClient } from '../config';
import { ChangePasswordData, UpdateProfileData, User, UserPreferences } from './types';

// Helper pour normaliser l'URL de l'avatar
export function normalizeUser(user: User): User {
  let avatarUrl = null;
  
  if (user.profileImage) {
    if (user.profileImage.startsWith('http') || user.profileImage.startsWith('data:')) {
      avatarUrl = user.profileImage;
    } else if (user.profileImage) {
      avatarUrl = `http://localhost:3001${user.profileImage}`;
    }
  } else if (user.picture && user.picture !== 'null') {
    avatarUrl = user.picture;
  } else if (user.avatar && user.avatar !== 'null') {
    if (user.avatar.startsWith('http') || user.avatar.startsWith('data:')) {
      avatarUrl = user.avatar;
    } else {
      avatarUrl = `http://localhost:3001${user.avatar}`;
    }
  }
  
  return {
    ...user,
    avatarUrl: avatarUrl || undefined,
  };
}

export const usersApi = {
  // ── Profile ─────────────────────────────────────────────────────────────
  getProfile: async (): Promise<User> => {
    const response = await apiClient.get('/users/me');
    return normalizeUser(response.data);
  },

  updateProfile: async (data: UpdateProfileData): Promise<User> => {
    const response = await apiClient.put('/users/me', data);
    return normalizeUser(response.data);
  },

  updatePreferences: async (preferences: UserPreferences): Promise<User> => {
    const response = await apiClient.put('/users/preferences', { preferences });
    return normalizeUser(response.data);
  },

  changePassword: async (data: ChangePasswordData): Promise<{ message: string }> => {
    const response = await apiClient.patch('/users/me/change-password', data);
    return response.data;
  },

  uploadAvatar: async (file: File): Promise<{ avatarUrl: string }> => {
    // Convertir le fichier en Base64
    const base64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
    
    const response = await apiClient.post('/users/avatar', { avatar: base64 });
    // Normaliser également l'utilisateur retourné si présent
    if (response.data.user) {
      response.data.user = normalizeUser(response.data.user);
    }
    return response.data;
  },

  // ── Admin ────────────────────────────────────────────────────────────────
  getAllUsers: async (role?: string): Promise<User[]> => {
    const params = role ? { role } : {};
    const response = await apiClient.get('/users', { params });
    return response.data.map((user: User) => normalizeUser(user));
  },

  getUserById: async (userId: string): Promise<User> => {
    const response = await apiClient.get(`/users/${userId}`);
    return normalizeUser(response.data);
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
    return normalizeUser(response.data);
  },

  banUser: async (userId: string): Promise<User> => {
    const response = await apiClient.patch(`/users/${userId}/ban`);
    return normalizeUser(response.data);
  },

  unbanUser: async (userId: string): Promise<User> => {
    const response = await apiClient.patch(`/users/${userId}/unban`);
    return normalizeUser(response.data);
  },
};