// frontend/components/NotificationModal.tsx
'use client';

import { useEffect, useState } from 'react';
import { Notification } from '@/lib/api/notifications';
import Image from 'next/image';
import {
  XMarkIcon,
  TagIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  CalendarIcon,
  MegaphoneIcon,
  BellIcon,
} from '@/components/ui/Icons';

interface NotificationModalProps {
  notification: Notification | null;
  isOpen: boolean;
  onClose: () => void;
  onMarkAsRead: (id: string) => void;
}

export default function NotificationModal({ 
  notification, 
  isOpen, 
  onClose, 
  onMarkAsRead 
}: NotificationModalProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      document.body.style.overflow = 'hidden';
    } else {
      setTimeout(() => setIsVisible(false), 300);
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isVisible || !notification) return null;

  const handleClose = () => {
    if (!notification.isRead) {
      onMarkAsRead(notification._id);
    }
    onClose();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTypeIcon = () => {
    switch (notification.type) {
      case 'reservation_confirmed':
        return <CheckCircleIcon className="w-6 h-6 text-success" />;
      case 'reservation_reminder':
        return <CalendarIcon className="w-6 h-6 text-warning" />;
      case 'advertisement':
        return <MegaphoneIcon className="w-6 h-6 text-purple-500" />;
      default:
        return <BellIcon className="w-6 h-6 text-primary" />;
    }
  };

  const getTypeLabel = () => {
    switch (notification.type) {
      case 'reservation_confirmed':
        return 'Réservation confirmée';
      case 'reservation_reminder':
        return 'Rappel';
      case 'reservation_cancelled':
        return 'Annulation';
      case 'reservation_expired':
        return 'Expiration';
      case 'advertisement':
        return 'Promotion';
      case 'promotion':
        return 'Offre spéciale';
      default:
        return 'Notification';
    }
  };

  return (
    <div className={`notification-modal-overlay ${isOpen ? 'open' : 'closed'}`} onClick={handleClose}>
      <div 
        className={`notification-modal-container ${isOpen ? 'open' : 'closed'}`}
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={handleClose} className="notification-modal-close">
          <XMarkIcon className="w-4 h-4" />
        </button>

        {notification.imageUrl && (
          <div className="notification-modal-image">
            <Image
              src={notification.imageUrl}
              alt={notification.title}
              fill
              className="object-cover"
              priority
            />
            <div className="notification-modal-image-overlay" />
          </div>
        )}

        <div className="notification-modal-content">
          <div className="notification-modal-type">
            <div className="notification-modal-type-icon">
              {getTypeIcon()}
            </div>
            <div className="notification-modal-type-label">
              <span className="notification-modal-type-badge">
                {getTypeLabel()}
              </span>
              {!notification.isRead && (
                <div className="notification-modal-unread-badge">
                  <span className="notification-modal-unread-dot" />
                  Non lu
                </div>
              )}
            </div>
          </div>

          <h3 className="notification-modal-title">
            {notification.title}
          </h3>
          
          <p className="notification-modal-message">
            {notification.message}
          </p>

          {notification.type === 'advertisement' && notification.data?.discountPercentage && (
            <div className="notification-modal-promo">
              <TagIcon className="w-4 h-4" />
              <span className="font-bold">-{notification.data.discountPercentage}%</span>
              {notification.data.discountCode && (
                <code className="notification-modal-promo-code">
                  {notification.data.discountCode}
                </code>
              )}
            </div>
          )}

          <div className="notification-modal-footer">
            <div className="notification-modal-date">
              <CalendarIcon className="w-3 h-3" />
              <span>Reçu le {formatDate(notification.createdAt)}</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}