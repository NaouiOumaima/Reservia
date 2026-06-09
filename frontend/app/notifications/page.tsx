'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { notificationsApi, Notification, NotificationType } from '@/lib/api/notifications';
import { useAuth } from '@/providers/AuthProvider';
import Image from 'next/image';
import toast, { Toaster } from 'react-hot-toast';
import {
  BellIcon, CheckIcon, TrashIcon, CheckCircleIcon, XMarkIcon,
  CalendarIcon, AlertTriangleIcon, MegaphoneIcon, TagIcon, Loader2Icon,
} from '@/components/ui/Icons';
import NotificationModal from '../components/NotificationModal';

function getIconInfo(type: NotificationType) {
  switch (type) {
    case NotificationType.RESERVATION_CONFIRMED: return { Icon: CheckCircleIcon,  cls: 'notif-icon-confirmed', label: 'Réservation confirmée' };
    case NotificationType.RESERVATION_REMINDER:  return { Icon: CalendarIcon,     cls: 'notif-icon-reminder',  label: 'Rappel' };
    case NotificationType.RESERVATION_CANCELLED: return { Icon: XMarkIcon,        cls: 'notif-icon-cancelled', label: 'Annulation' };
    case NotificationType.RESERVATION_EXPIRED:   return { Icon: AlertTriangleIcon,cls: 'notif-icon-expired',   label: 'Expirée' };
    case NotificationType.ADVERTISEMENT:         return { Icon: MegaphoneIcon,    cls: 'notif-icon-ad',        label: 'Promotion' };
    case NotificationType.PROMOTION:             return { Icon: TagIcon,          cls: 'notif-icon-promo',     label: 'Offre spéciale' };
    default:                                     return { Icon: BellIcon,         cls: 'notif-icon-default',   label: 'Information' };
  }
}

function formatDate(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours   = Math.floor(diff / 3600000);
  const days    = Math.floor(diff / 86400000);
  if (minutes < 1) return 'À l\'instant';
  if (minutes < 60) return `Il y a ${minutes} min`;
  if (hours < 24) return `Il y a ${hours} h`;
  if (days < 7)  return `Il y a ${days} j`;
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
}

type FilterType = 'all' | 'unread' | NotificationType;

// Fonction pour générer l'URL de redirection selon le type de notification et le rôle
// Fonction pour générer l'URL de redirection selon le type de notification et le rôle
function getRedirectUrl(notification: Notification, userRole?: string): string | null {
  const data = notification.data;
  
  // Réservations
  if (notification.type === NotificationType.RESERVATION_CONFIRMED ||
      notification.type === NotificationType.RESERVATION_REMINDER ||
      notification.type === NotificationType.RESERVATION_CANCELLED ||
      notification.type === NotificationType.RESERVATION_EXPIRED) {
    
    // Utiliser reservationId directement depuis la notification
    const reservationId = notification.reservationId;
    
    if (userRole === 'provider') {
      if (reservationId) {
        return `/provider/bookings?bookingId=${reservationId}`;
      }
      return '/provider/bookings';
    } else {
      if (reservationId) {
        return `/client/bookings?bookingId=${reservationId}`;
      }
      return '/client/bookings';
    }
  }
  
  // Annonce publicitaire
  if (notification.type === NotificationType.ADVERTISEMENT) {
    // Utiliser actionUrl s'il existe, sinon retourner au search
    if (notification.actionUrl) {
      return notification.actionUrl;
    }
    if (data?.actionUrl) {
      return data.actionUrl;
    }
    return '/search';
  }
  
  // Promotion
  if (notification.type === NotificationType.PROMOTION) {
    // Utiliser actionUrl s'il existe
    if (notification.actionUrl) {
      return notification.actionUrl;
    }
    if (data?.actionUrl) {
      return data.actionUrl;
    }
    return '/search';
  }
  
  // Système - utiliser actionUrl si disponible
  if (notification.type === NotificationType.SYSTEM) {
    if (notification.actionUrl) {
      return notification.actionUrl;
    }
    if (data?.actionUrl) {
      return data.actionUrl;
    }
    return null;
  }
  
  // Default: retour null (ouvre le modal au lieu de rediriger)
  return null;
}

export default function NotificationsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [notifications, setNotifications]       = useState<Notification[]>([]);
  const [loading, setLoading]                   = useState(true);
  const [unreadCount, setUnreadCount]           = useState(0);
  const [page, setPage]                         = useState(1);
  const [hasMore, setHasMore]                   = useState(true);
  const [loadingMore, setLoadingMore]           = useState(false);
  const [selectedNotif, setSelectedNotif]       = useState<Notification | null>(null);
  const [modalOpen, setModalOpen]               = useState(false);
  const [filter, setFilter]                     = useState<FilterType>('all');

  const fetchNotifications = useCallback(async (pageNum: number, append = false) => {
    try {
      const res = await notificationsApi.getMyNotifications(pageNum, 20);
      setNotifications(prev => append ? [...prev, ...res.notifications] : res.notifications);
      setHasMore(res.hasMore);
    } catch { toast.error('Impossible de charger les notifications'); }
  }, []);

  const fetchUnread = useCallback(async () => {
    try { setUnreadCount(await notificationsApi.getUnreadCount()); } catch {}
  }, []);

  useEffect(() => {
    Promise.all([fetchNotifications(1), fetchUnread()]).finally(() => setLoading(false));
  }, [fetchNotifications, fetchUnread]);

  const markAsRead = async (id: string) => {
    try {
      await notificationsApi.markAsRead(id);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch { toast.error('Erreur lors du marquage'); }
  };

  const markAllAsRead = async () => {
    const tid = toast.loading('Marquage en cours…');
    try {
      await notificationsApi.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
      toast.success('Toutes les notifications marquées comme lues', { id: tid });
    } catch { toast.error('Erreur', { id: tid }); }
  };

  const deleteNotif = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const tid = toast.loading('Suppression…');
    try {
      await notificationsApi.deleteNotification(id);
      setNotifications(prev => prev.filter(n => n._id !== id));
      toast.success('Notification supprimée', { id: tid });
    } catch { toast.error('Erreur', { id: tid }); }
  };

  const deleteAllRead = async () => {
    if (!confirm('Supprimer toutes les notifications lues ?')) return;
    const tid = toast.loading('Suppression…');
    try {
      await notificationsApi.deleteAllReadNotifications();
      setNotifications(prev => prev.filter(n => !n.isRead));
      toast.success('Notifications lues supprimées', { id: tid });
    } catch { toast.error('Erreur', { id: tid }); }
  };

  const loadMore = async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    const next = page + 1;
    await fetchNotifications(next, true);
    setPage(next);
    setLoadingMore(false);
  };

  // Gestion du clic sur une notification
  const handleNotificationClick = async (notification: Notification) => {
    // Si la notification n'est pas lue, la marquer comme lue
    if (!notification.isRead) {
      await markAsRead(notification._id);
      notification.isRead = true;
    }
    
    // Vérifier s'il y a une redirection spécifique
    const redirectUrl = getRedirectUrl(notification, user?.role);
    
    if (redirectUrl) {
      // Rediriger vers la page correspondante
      router.push(redirectUrl);
    } else {
      // Sinon ouvrir le modal
      setSelectedNotif(notification);
      setModalOpen(true);
    }
  };

  const displayed = notifications.filter(n => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !n.isRead;
    return n.type === filter;
  });

  const filters: { key: FilterType; label: string }[] = [
    { key: 'all',    label: 'Toutes' },
    { key: 'unread', label: 'Non lues' },
    { key: NotificationType.RESERVATION_CONFIRMED, label: 'Confirmations' },
    { key: NotificationType.ADVERTISEMENT,         label: 'Promotions' },
  ];

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="admin-loading-content">
          <Loader2Icon className="w-8 h-8 animate-spin text-primary" />
          <p className="text-muted">Chargement…</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Toaster position="top-right" />

      <div className="notifications-page">
        <div className="notifications-container">

          {/* ── Header ── */}
          <div className="notifications-header">
            <div className="notifications-header-top">
              <div className="notifications-header-left">
                <h1>
                  <BellIcon className="w-6 h-6" />
                  Mes notifications
                </h1>
                {unreadCount > 0 && (
                  <p className="notifications-header-count">
                    {unreadCount} non lue{unreadCount > 1 ? 's' : ''}
                  </p>
                )}
              </div>
              <div className="notifications-header-actions">
                {unreadCount > 0 && (
                  <button onClick={markAllAsRead} className="btn btn-primary btn-sm">
                    <CheckIcon className="w-4 h-4" />
                    Tout lire
                  </button>
                )}
                {notifications.some(n => n.isRead) && (
                  <button onClick={deleteAllRead} className="btn btn-ghost btn-sm">
                    <TrashIcon className="w-4 h-4" />
                    Supprimer lues
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* ── Filters ── */}
          <div className="notifications-filters">
            {filters.map(f => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`filter-chip ${filter === f.key ? 'active' : ''}`}
              >
                {f.label}
                {f.key === 'unread' && unreadCount > 0 && (
                  <span className="badge badge-primary" style={{ fontSize: '0.6rem', padding: '0.1rem 0.4rem' }}>
                    {unreadCount}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* ── List or Empty ── */}
          {displayed.length === 0 ? (
            <div className="notifications-empty">
              <div className="notifications-empty-icon">
                <BellIcon className="w-8 h-8" />
              </div>
              <h3 className="notifications-empty-title">Aucune notification</h3>
              <p className="notifications-empty-text">
                {filter !== 'all' ? 'Aucune notification dans cette catégorie.' : 'Vous n\'avez pas encore de notifications.'}
              </p>
            </div>
          ) : (
            <div className="notifications-list">
              {displayed.map((notif, i) => {
                const { Icon, cls, label } = getIconInfo(notif.type);
                const isUnread = !notif.isRead;
                const redirectUrl = getRedirectUrl(notif, user?.role);
                const hasRedirect = redirectUrl !== null;

                return (
                  <div
                    key={notif._id}
                    onClick={() => handleNotificationClick(notif)}
                    className={`notif-card ${isUnread ? 'notif-card-unread' : 'notif-card-read'} animate-fadeInUp ${hasRedirect ? 'cursor-pointer' : ''}`}
                    style={{ animationDelay: `${i * 40}ms` }}
                  >
                    <div className="notif-card-inner">
                      {/* Icon */}
                      <div className={`notif-icon-wrap ${cls}`}>
                        {notif.imageUrl
                          ? <Image src={notif.imageUrl} alt="" width={44} height={44} className="rounded-full object-cover" />
                          : <Icon className="w-5 h-5" />}
                      </div>

                      {/* Body */}
                      <div className="notif-body">
                        <div className="notif-body-top">
                          <div className="notif-title-row">
                            <p className="notif-title">{notif.title}</p>
                            <span className="notif-type-label">{label}</span>
                          </div>
                          <span className="notif-date">{formatDate(notif.createdAt)}</span>
                        </div>
                        <p className="notif-message">{notif.message}</p>

                        {notif.type === NotificationType.ADVERTISEMENT && notif.data?.discountPercentage && (
                          <span className="notif-promo-badge">
                            <TagIcon className="w-3 h-3" />
                            -{notif.data.discountPercentage}%
                          </span>
                        )}
                        
                        {/* Indicateur de redirection */}
                        {hasRedirect && (
                          <span className="inline-flex items-center gap-1 mt-2 text-xs text-primary">
                            Cliquez pour consulter →
                          </span>
                        )}
                      </div>

                      {/* Unread dot */}
                      {isUnread && <span className="notif-unread-dot" />}
                    </div>

                    {/* Card actions */}
                    <div className="notif-card-actions">
                      {isUnread && (
                        <button
                          onClick={(e) => { e.stopPropagation(); markAsRead(notif._id); }}
                          className="notif-action-btn notif-action-btn-read"
                        >
                          <CheckIcon className="w-3 h-3" />
                          Marquer lu
                        </button>
                      )}
                      <button
                        onClick={(e) => deleteNotif(e, notif._id)}
                        className="notif-action-btn notif-action-btn-delete"
                      >
                        <TrashIcon className="w-3 h-3" />
                        Supprimer
                      </button>
                    </div>
                  </div>
                );
              })}

              {/* Load more */}
              {hasMore && (
                <div className="notifications-load-more">
                  <button onClick={loadMore} disabled={loadingMore} className="btn btn-ghost">
                    {loadingMore
                      ? <Loader2Icon className="w-4 h-4 animate-spin" />
                      : 'Charger plus'}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <NotificationModal
        notification={selectedNotif}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onMarkAsRead={markAsRead}
      />
    </>
  );
}