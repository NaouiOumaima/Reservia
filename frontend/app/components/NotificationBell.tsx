// frontend/context/NotificationContext.tsx
'use client';

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { notificationsApi } from '@/lib/api/notifications';
import { Notification } from '@/lib/api/notifications';
import { useSocket } from '@/hooks/useSocket';
import toast from 'react-hot-toast';

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  deleteAllRead: () => Promise<void>;
  fetchNotifications: () => Promise<void>;
  refreshUnreadCount: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const { socket } = useSocket();

  const fetchNotifications = useCallback(async (pageNum: number = 1, append: boolean = false) => {
    try {
      const response = await notificationsApi.getMyNotifications(pageNum, 50);
      
      if (append) {
        setNotifications(prev => [...prev, ...response.notifications]);
      } else {
        setNotifications(response.notifications);
      }
      
      setHasMore(response.hasMore);
      setPage(pageNum);
      
      const unread = response.notifications.filter((n: Notification) => !n.isRead).length;
      setUnreadCount(unread);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast.error('Impossible de charger les notifications');
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshUnreadCount = useCallback(async () => {
    try {
      const count = await notificationsApi.getUnreadCount();
      setUnreadCount(count);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  }, []);

  const loadMore = useCallback(async () => {
    if (!hasMore || loading) return;
    await fetchNotifications(page + 1, true);
  }, [hasMore, loading, page, fetchNotifications]);

  // Chargement initial
  useEffect(() => {
    fetchNotifications(1, false);
  }, [fetchNotifications]);

  // Rafraîchir le compteur périodiquement (optionnel)
  useEffect(() => {
    const interval = setInterval(() => {
      refreshUnreadCount();
    }, 30000); // Toutes les 30 secondes
    
    return () => clearInterval(interval);
  }, [refreshUnreadCount]);

  // Écouter les nouvelles notifications via WebSocket
  useEffect(() => {
    if (!socket) return;

    const handleNewNotification = (notification: Notification) => {
      console.log('New notification received:', notification);
      
      // Ajouter la notification en haut de la liste
      setNotifications(prev => [notification, ...prev]);
      setUnreadCount(prev => prev + 1);
      
      // Afficher un toast pour la nouvelle notification
      toast.success(notification.title, {
        duration: 4000,
        icon: '🔔',
        position: 'top-right',
      });
    };

    const handleNotificationRead = (data: { notificationId: string }) => {
      setNotifications(prev => prev.map(n => 
        n._id === data.notificationId ? { ...n, isRead: true } : n
      ));
      refreshUnreadCount();
    };

    const handleAllNotificationsRead = () => {
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    };

    const handleNotificationDeleted = (data: { notificationId: string }) => {
      setNotifications(prev => prev.filter(n => n._id !== data.notificationId));
      refreshUnreadCount();
    };

    socket.on('new_notification', handleNewNotification);
    socket.on('notification_read', handleNotificationRead);
    socket.on('all_notifications_read', handleAllNotificationsRead);
    socket.on('notification_deleted', handleNotificationDeleted);

    return () => {
      socket.off('new_notification', handleNewNotification);
      socket.off('notification_read', handleNotificationRead);
      socket.off('all_notifications_read', handleAllNotificationsRead);
      socket.off('notification_deleted', handleNotificationDeleted);
    };
  }, [socket, refreshUnreadCount]);

  const markAsRead = useCallback(async (id: string) => {
    try {
      await notificationsApi.markAsRead(id);
      setNotifications(prev => prev.map(n => (n._id === id ? { ...n, isRead: true } : n)));
      setUnreadCount(prev => Math.max(0, prev - 1));
      
      // Notifier via WebSocket
      if (socket) {
        socket.emit('markAsRead', { notificationId: id });
      }
    } catch (error) {
      console.error('Error marking as read:', error);
      toast.error('Erreur lors du marquage');
    }
  }, [socket]);

  const markAllAsRead = useCallback(async () => {
    try {
      await notificationsApi.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
      
      if (socket) {
        socket.emit('markAllAsRead');
      }
      
      toast.success('Toutes les notifications ont été marquées comme lues');
    } catch (error) {
      console.error('Error marking all as read:', error);
      toast.error('Erreur lors du marquage');
    }
  }, [socket]);

  const deleteNotification = useCallback(async (id: string) => {
    try {
      const notification = notifications.find(n => n._id === id);
      await notificationsApi.deleteNotification(id);
      setNotifications(prev => prev.filter(n => n._id !== id));
      
      if (notification && !notification.isRead) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      
      if (socket) {
        socket.emit('deleteNotification', { notificationId: id });
      }
      
      toast.success('Notification supprimée');
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast.error('Erreur lors de la suppression');
    }
  }, [notifications, socket]);

  const deleteAllRead = useCallback(async () => {
    try {
      await notificationsApi.deleteAllReadNotifications();
      setNotifications(prev => prev.filter(n => !n.isRead));
      
      if (socket) {
        socket.emit('deleteAllRead');
      }
      
      toast.success('Notifications lues supprimées');
    } catch (error) {
      console.error('Error deleting read notifications:', error);
      toast.error('Erreur lors de la suppression');
    }
  }, [socket]);

  const value = {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllRead,
    fetchNotifications: () => fetchNotifications(1, false),
    refreshUnreadCount,
    loadMore,
    hasMore,
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