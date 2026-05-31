// frontend/context/NotificationContext.tsx
'use client';

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { notificationsApi } from '@/lib/api/notifications/notifications.api';
import { Notification } from '@/lib/api/notifications/types';
import { useSocket } from '@/hooks/useSocket';
import { getAccessToken } from '@/lib/helpers/storage';

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  isConnected: boolean;
  markAsRead: (id?: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  clearNotifications: () => Promise<void>; // Pour effacer les notifications lues
  fetchNotifications: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const { socket, isConnected } = useSocket();

  const fetchNotifications = useCallback(async () => {
    const token = getAccessToken();
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const response = await notificationsApi.getMyNotifications(1, 50);
      setNotifications(response.notifications);
      const unread = response.notifications.filter((n: Notification) => !n.isRead).length;
      setUnreadCount(unread);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchUnreadCount = useCallback(async () => {
    const token = getAccessToken();
    if (!token) return;

    try {
      const count = await notificationsApi.getUnreadCount();
      setUnreadCount(count);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  }, []);

  // Chargement initial
  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      setLoading(false);
      return;
    }

    fetchNotifications();
  }, [fetchNotifications]);

  // Polling de secours si WebSocket n'est pas connecté
  useEffect(() => {
    let pollInterval: NodeJS.Timeout;
    const token = getAccessToken();

    if (!isConnected && token) {
      console.log('WebSocket not connected, using polling fallback (every 10s)');
      pollInterval = setInterval(() => {
        console.log('Polling for new notifications...');
        fetchUnreadCount();
        fetchNotifications();
      }, 10000); // Poll toutes les 10 secondes
    }
    
    return () => {
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [isConnected, fetchUnreadCount, fetchNotifications]);

  // Écouter les nouvelles notifications via WebSocket
  useEffect(() => {
    if (!socket) {
      console.log('No socket instance available');
      return;
    }

    console.log('Setting up WebSocket notification listener');
    
    const handleNotification = (rawNotification: any) => {
      const notification = {
        ...rawNotification,
        _id: rawNotification._id || rawNotification.id,
      } as Notification;

      console.log('✨ New notification received via WebSocket:', notification);
      setNotifications(prev => {
        // Éviter les doublons
        const exists = prev.some(n => n._id === notification._id);
        if (exists) return prev;
        return [notification, ...prev];
      });
      setUnreadCount(prev => prev + 1);
    };

    socket.on('notification', handleNotification);

    return () => {
      console.log('Cleaning up WebSocket notification listener');
      socket.off('notification', handleNotification);
    };
  }, [socket]);

  const markAsRead = useCallback(async (id?: string) => {
    try {
      if (id) {
        // Marquer une notification spécifique comme lue
        await notificationsApi.markAsRead(id);
        setNotifications(prev => prev.map(n => 
          n._id === id ? { ...n, isRead: true } : n
        ));
        setUnreadCount(prev => Math.max(0, prev - 1));
        
        if (socket) {
          socket.emit('markAsRead', { notificationId: id });
        }
      } else {
        // Si pas d'ID, marquer toutes comme lues
        await markAllAsRead();
      }
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  }, [socket]);

  const markAllAsRead = useCallback(async () => {
    try {
      await notificationsApi.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  }, []);

  const deleteNotification = useCallback(async (id: string) => {
    try {
      const notification = notifications.find(n => n._id === id);
      await notificationsApi.deleteNotification(id);
      setNotifications(prev => prev.filter(n => n._id !== id));
      if (notification && !notification.isRead) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  }, [notifications]);

  // Effacer toutes les notifications lues
  const clearNotifications = useCallback(async () => {
    try {
      await notificationsApi.deleteAllReadNotifications();
      // Garder seulement les notifications non lues
      setNotifications(prev => prev.filter(n => !n.isRead));
    } catch (error) {
      console.error('Error clearing notifications:', error);
    }
  }, []);

  const value = {
    notifications,
    unreadCount,
    loading,
    isConnected,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearNotifications,
    fetchNotifications,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
};