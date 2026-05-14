// frontend/app/notifications/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { notificationsApi } from '@/lib/api/notifications';
import { Notification, NotificationType } from '@/lib/api/notifications';
import { useAuth } from '@/providers/AuthProvider';
import Image from 'next/image';
import toast, { Toaster } from 'react-hot-toast';
import {
  BellIcon,
  CheckIcon,
  TrashIcon,
  CheckCircleIcon,
  XMarkIcon,
  CalendarIcon,
  AlertTriangleIcon,
  MegaphoneIcon,
  TagIcon,
  Loader2Icon,
} from '@/components/ui/Icons';
import NotificationModal from '../components/NotificationModal';

interface NotificationIconInfo {
  icon: React.ComponentType<{ className?: string }>;
  bgClass: string;
  label: string;
  colorClass: string;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const { user } = useAuth();

  const fetchNotifications = useCallback(async (pageNum: number, append: boolean = false) => {
    try {
      const response = await notificationsApi.getMyNotifications(pageNum, 20);
      
      if (append) {
        setNotifications((prev: Notification[]) => [...prev, ...response.notifications]);
      } else {
        setNotifications(response.notifications);
      }
      
      setHasMore(response.hasMore);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      toast.error('Impossible de charger les notifications');
    }
  }, []);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const count = await notificationsApi.getUnreadCount();
      setUnreadCount(count);
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    }
  }, []);

  useEffect(() => {
    Promise.all([
      fetchNotifications(1, false),
      fetchUnreadCount(),
    ]).finally(() => setLoading(false));
  }, [fetchNotifications, fetchUnreadCount]);

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await notificationsApi.markAsRead(notificationId);
      setNotifications((prev: Notification[]) =>
        prev.map((n: Notification) => (n._id === notificationId ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev: number) => Math.max(0, prev - 1));
    } catch (error) {
      toast.error('Erreur lors du marquage');
    }
  };

  const handleMarkAllAsRead = async () => {
    const toastId = toast.loading('Marquage en cours...');
    try {
      await notificationsApi.markAllAsRead();
      setNotifications((prev: Notification[]) => prev.map((n: Notification) => ({ ...n, isRead: true })));
      setUnreadCount(0);
      toast.success('Toutes les notifications ont été marquées comme lues', { id: toastId });
    } catch (error) {
      toast.error('Erreur lors du marquage', { id: toastId });
    }
  };

  const handleDeleteNotification = async (notificationId: string) => {
    const toastId = toast.loading('Suppression...');
    try {
      await notificationsApi.deleteNotification(notificationId);
      setNotifications((prev: Notification[]) => prev.filter((n: Notification) => n._id !== notificationId));
      toast.success('Notification supprimée', { id: toastId });
    } catch (error) {
      toast.error('Erreur lors de la suppression', { id: toastId });
    }
  };

  const handleDeleteAllRead = async () => {
    if (!confirm('Supprimer toutes les notifications lues ?')) return;
    const toastId = toast.loading('Suppression...');
    try {
      await notificationsApi.deleteAllReadNotifications();
      setNotifications((prev: Notification[]) => prev.filter((n: Notification) => !n.isRead));
      toast.success('Notifications lues supprimées', { id: toastId });
    } catch (error) {
      toast.error('Erreur lors de la suppression', { id: toastId });
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    setSelectedNotification(notification);
    setModalOpen(true);
  };

  const handleMarkAsReadFromModal = async (id: string) => {
    await handleMarkAsRead(id);
  };

  const loadMore = async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    const nextPage = page + 1;
    await fetchNotifications(nextPage, true);
    setPage(nextPage);
    setLoadingMore(false);
  };

  const getNotificationIcon = (type: NotificationType): NotificationIconInfo => {
    switch (type) {
      case NotificationType.RESERVATION_CONFIRMED:
        return { icon: CheckCircleIcon, bgClass: 'bg-success/10', label: 'Réservation confirmée', colorClass: 'text-success' };
      case NotificationType.RESERVATION_REMINDER:
        return { icon: CalendarIcon, bgClass: 'bg-warning/10', label: 'Rappel', colorClass: 'text-warning' };
      case NotificationType.RESERVATION_CANCELLED:
        return { icon: XMarkIcon, bgClass: 'bg-error/10', label: 'Annulation', colorClass: 'text-error' };
      case NotificationType.RESERVATION_EXPIRED:
        return { icon: AlertTriangleIcon, bgClass: 'bg-orange-500/10', label: 'Expiration', colorClass: 'text-orange-500' };
      case NotificationType.ADVERTISEMENT:
        return { icon: MegaphoneIcon, bgClass: 'bg-purple-500/10', label: 'Promotion', colorClass: 'text-purple-500' };
      case NotificationType.PROMOTION:
        return { icon: TagIcon, bgClass: 'bg-pink-500/10', label: 'Offre spéciale', colorClass: 'text-pink-500' };
      default:
        return { icon: BellIcon, bgClass: 'bg-surface-raised', label: 'Information', colorClass: 'text-muted' };
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'À l\'instant';
    if (minutes < 60) return `Il y a ${minutes} min`;
    if (hours < 24) return `Il y a ${hours} h`;
    if (days < 7) return `Il y a ${days} j`;
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="admin-loading-content">
          <Loader2Icon className="w-8 h-8 animate-spin text-primary" />
          <p className="text-muted">Chargement des notifications...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Toaster position="top-right" />
      
      <div className="notifications-page">
        <div className="notifications-container">
          <div className="notifications-header">
            <div className="flex justify-between items-center flex-wrap gap-4">
              <div>
                <h1 className="notifications-header-title">
                  <BellIcon className="w-6 h-6" />
                  Mes notifications
                </h1>
                {unreadCount > 0 && (
                  <p className="notifications-header-count">
                    {unreadCount} notification{unreadCount > 1 ? 's' : ''} non lue{unreadCount > 1 ? 's' : ''}
                  </p>
                )}
              </div>
              <div className="notifications-actions">
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllAsRead}
                    className="btn-sm bg-primary text-white hover:bg-primary-dark transition-colors"
                  >
                    <CheckIcon className="w-4 h-4" />
                    Tout lire
                  </button>
                )}
                {notifications.some((n: Notification) => n.isRead) && (
                  <button
                    onClick={handleDeleteAllRead}
                    className="btn-sm bg-surface-raised hover:bg-error/10 text-muted hover:text-error transition-colors"
                  >
                    <TrashIcon className="w-4 h-4" />
                    Supprimer lues
                  </button>
                )}
              </div>
            </div>
          </div>

          {notifications.length === 0 ? (
            <div className="admin-reviews-empty">
              <div className="admin-reviews-empty-icon">
                <BellIcon className="w-12 h-12" />
              </div>
              <h3 className="admin-reviews-empty-title">Aucune notification</h3>
              <p className="admin-reviews-empty-text">Vous n'avez pas encore de notifications</p>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map((notification: Notification) => {
                const { icon: Icon, bgClass, label, colorClass } = getNotificationIcon(notification.type);
                const isUnread = !notification.isRead;
                
                return (
                  <div
                    key={notification._id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`notification-card ${isUnread ? 'notification-card-unread' : 'notification-card-read'}`}
                  >
                    <div className="notification-card-content">
                      <div className={`notification-icon-wrapper ${bgClass}`}>
                        {notification.imageUrl ? (
                          <Image
                            src={notification.imageUrl}
                            alt=""
                            width={48}
                            height={48}
                            className="rounded-full object-cover w-full h-full"
                          />
                        ) : (
                          <Icon className={`w-6 h-6 ${colorClass}`} />
                        )}
                      </div>
                      
                      <div className="notification-info">
                        <div className="notification-header">
                          <div>
                            <h3 className={`notification-title ${isUnread ? 'notification-title-unread' : 'notification-title-read'}`}>
                              {notification.title}
                            </h3>
                            <span className="notification-type">{label}</span>
                          </div>
                          <span className="notification-date">
                            {formatDate(notification.createdAt)}
                          </span>
                        </div>
                        <p className={`notification-message ${isUnread ? 'notification-message-unread' : 'notification-message-read'}`}>
                          {notification.message}
                        </p>
                        
                        {notification.type === NotificationType.ADVERTISEMENT && notification.data?.discountPercentage && (
                          <div className="notification-badge">
                            <TagIcon className="w-3 h-3" />
                            -{notification.data.discountPercentage}%
                          </div>
                        )}
                      </div>
                      
                      <div className="notification-actions">
                        {isUnread && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMarkAsRead(notification._id);
                            }}
                            className="notification-mark-read"
                          >
                            Marquer lu
                          </button>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteNotification(notification._id);
                          }}
                          className="notification-delete"
                        >
                          Supprimer
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
              
              {hasMore && (
                <div className="notifications-load-more">
                  <button
                    onClick={loadMore}
                    disabled={loadingMore}
                    className="btn-ghost"
                  >
                    {loadingMore ? (
                      <Loader2Icon className="w-4 h-4 animate-spin" />
                    ) : (
                      'Charger plus'
                    )}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <NotificationModal
        notification={selectedNotification}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onMarkAsRead={handleMarkAsReadFromModal}
      />
    </>
  );
}