'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  BellIcon, CheckCircleIcon, CalendarIcon, XMarkIcon,
  AlertTriangleIcon, MegaphoneIcon, TagIcon,
} from '@/components/ui/Icons';
import Image from 'next/image';
import { Notification, NotificationType } from '@/lib/api/notifications';
import NotificationModal from './NotificationModal';
import { useNotifications } from './NotificationBell';

function getIconInfo(type: string) {
  switch (type) {
    case NotificationType.RESERVATION_CONFIRMED: return { Icon: CheckCircleIcon,   cls: 'notif-icon-confirmed' };
    case NotificationType.RESERVATION_REMINDER:  return { Icon: CalendarIcon,      cls: 'notif-icon-reminder' };
    case NotificationType.RESERVATION_CANCELLED: return { Icon: XMarkIcon,         cls: 'notif-icon-cancelled' };
    case NotificationType.RESERVATION_EXPIRED:   return { Icon: AlertTriangleIcon, cls: 'notif-icon-expired' };
    case NotificationType.ADVERTISEMENT:         return { Icon: MegaphoneIcon,     cls: 'notif-icon-ad' };
    case NotificationType.PROMOTION:             return { Icon: TagIcon,           cls: 'notif-icon-promo' };
    default:                                     return { Icon: BellIcon,          cls: 'notif-icon-default' };
  }
}

function formatDate(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (minutes < 1) return 'À l\'instant';
  if (minutes < 60) return `${minutes} min`;
  if (hours < 24) return `${hours} h`;
  if (days < 7) return `${days} j`;
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}

// Types qui ouvrent une modale au lieu de naviguer
const MODAL_TYPES = [NotificationType.ADVERTISEMENT, NotificationType.PROMOTION];

export default function NotificationDropdown() {
  const [isOpen, setIsOpen]           = useState(false);
  const [selectedNotif, setSelectedNotif] = useState<Notification | null>(null);
  const [modalOpen, setModalOpen]     = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const router  = useRouter();
  const { notifications, unreadCount, markAsRead, loading } = useNotifications();

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  const handleItemClick = (notif: Notification) => {
    if (!notif.isRead) markAsRead(notif._id);

    if (MODAL_TYPES.includes(notif.type as NotificationType)) {
      // Ouvrir la modale, pas de navigation
      setSelectedNotif(notif);
      setIsOpen(false);
      setModalOpen(true);
    } else {
      // Navigation normale
      router.push(notif.actionUrl || '/notifications');
      setIsOpen(false);
    }
  };

  const displayed = notifications.slice(0, 5);

  return (
    <>
      <div className="notif-dropdown-wrap" ref={wrapRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="notif-dropdown-trigger"
          aria-label="Notifications"
        >
          <BellIcon className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="notif-dropdown-badge">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {isOpen && (
          <div className="notif-dropdown-panel">
            {/* Header */}
            <div className="notif-dropdown-header">
              <span className="notif-dropdown-header-title">Notifications</span>
              <button
                onClick={() => { router.push('/notifications'); setIsOpen(false); }}
                className="notif-dropdown-see-all"
              >
                Voir tout
              </button>
            </div>

            {/* List */}
            <div className="notif-dropdown-list">
              {loading ? (
                <div className="notif-dropdown-empty">
                  <div className="spinner" style={{ width: 28, height: 28 }} />
                </div>
              ) : displayed.length === 0 ? (
                <div className="notif-dropdown-empty">
                  <BellIcon className="w-8 h-8" />
                  <p>Aucune notification</p>
                </div>
              ) : (
                displayed.map((notif) => {
                  const { Icon, cls } = getIconInfo(notif.type);
                  return (
                    <div
                      key={notif._id}
                      onClick={() => handleItemClick(notif)}
                      className={`notif-dropdown-item cursor-pointer ${!notif.isRead ? 'notif-dropdown-item-unread' : ''}`}
                    >
                      <div className={`notif-dropdown-icon ${cls}`}>
                        {notif.imageUrl
                          ? <Image src={notif.imageUrl} alt="" width={36} height={36} className="rounded-full object-cover" />
                          : <Icon className="w-4 h-4" />}
                      </div>
                      <div className="notif-dropdown-body">
                        <p className="notif-dropdown-title">{notif.title}</p>
                        <p className="notif-dropdown-msg">{notif.message}</p>
                        <p className="notif-dropdown-time">{formatDate(notif.createdAt)}</p>
                      </div>
                      {!notif.isRead && <span className="notif-dropdown-dot" />}
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            {notifications.length > 5 && (
              <div className="notif-dropdown-footer">
                <button onClick={() => { router.push('/notifications'); setIsOpen(false); }}>
                  Voir toutes ({notifications.length})
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modale pour ads/promos */}
      <NotificationModal
        notification={selectedNotif}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onMarkAsRead={markAsRead}
      />
    </>
  );
}