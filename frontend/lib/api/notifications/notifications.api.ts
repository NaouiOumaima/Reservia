// frontend/lib/api/notifications/notifications.api.ts

import { apiClient } from '../config';
import { Notification, NotificationsResponse, UnreadCountResponse } from './types';

export const notificationsApi = {
  // Récupérer toutes les notifications de l'utilisateur connecté
  getMyNotifications: async (page: number = 1, limit: number = 20, unreadOnly: boolean = false): Promise<NotificationsResponse> => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    if (unreadOnly) params.append('unreadOnly', 'true');
    
    const response = await apiClient.get(`/notifications?${params}`);
    return response.data;
  },

  // Récupérer les notifications non lues
  getUnreadNotifications: async (): Promise<Notification[]> => {
    const response = await apiClient.get('/notifications/unread');
    return response.data;
  },

  // Compter les notifications non lues
  getUnreadCount: async (): Promise<number> => {
    const response = await apiClient.get<UnreadCountResponse>('/notifications/unread/count');
    return response.data.count;
  },

  // Marquer une notification comme lue
  markAsRead: async (notificationId: string): Promise<Notification> => {
    const response = await apiClient.post(`/notifications/${notificationId}/read`);
    return response.data;
  },

  // Marquer toutes les notifications comme lues
  markAllAsRead: async (): Promise<void> => {
    await apiClient.post('/notifications/read-all');
  },

  // Supprimer une notification
  deleteNotification: async (notificationId: string): Promise<void> => {
    await apiClient.delete(`/notifications/${notificationId}`);
  },

  // Supprimer toutes les notifications lues
  deleteAllReadNotifications: async (): Promise<void> => {
    await apiClient.delete('/notifications/read/all');
  },
};