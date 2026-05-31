'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Notification, NotificationType } from '@/lib/api/notifications';
import Image from 'next/image';
import {
  XMarkIcon, TagIcon, CheckCircleIcon, CalendarIcon,
  MegaphoneIcon, BellIcon, AlertTriangleIcon,
} from '@/components/ui/Icons';

interface Props {
  notification: Notification | null;
  isOpen: boolean;
  onClose: () => void;
  onMarkAsRead: (id: string) => void;
}

const MODAL_TYPES = [NotificationType.ADVERTISEMENT, NotificationType.PROMOTION];

function getTypeInfo(type: string) {
  switch (type) {
    case 'reservation_confirmed': return { Icon: CheckCircleIcon,   cls: 'notif-icon-confirmed', label: 'Réservation confirmée' };
    case 'reservation_reminder':  return { Icon: CalendarIcon,      cls: 'notif-icon-reminder',  label: 'Rappel' };
    case 'reservation_cancelled': return { Icon: XMarkIcon,         cls: 'notif-icon-cancelled', label: 'Annulation' };
    case 'reservation_expired':   return { Icon: AlertTriangleIcon, cls: 'notif-icon-expired',   label: 'Expirée' };
    case 'advertisement':         return { Icon: MegaphoneIcon,     cls: 'notif-icon-ad',        label: 'Promotion' };
    case 'promotion':             return { Icon: TagIcon,           cls: 'notif-icon-promo',     label: 'Offre spéciale' };
    default:                      return { Icon: BellIcon,          cls: 'notif-icon-default',   label: 'Notification' };
  }
}

function formatFull(dateString: string) {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: 'numeric', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function formatExpiry(dateString: string) {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
}

export default function NotificationModal({ notification, isOpen, onClose, onMarkAsRead }: Props) {
  const [visible, setVisible] = useState(false);
  const [mounted, setMounted] = useState(false);

  // S'assurer qu'on est côté client pour createPortal
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setVisible(true);
      document.body.style.overflow = 'hidden';
    } else {
      const t = setTimeout(() => setVisible(false), 300);
      document.body.style.overflow = '';
      return () => clearTimeout(t);
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!mounted || !visible || !notification) return null;

  const handleClose = () => {
    if (!notification.isRead) onMarkAsRead(notification._id);
    onClose();
  };

  const { Icon, cls, label } = getTypeInfo(notification.type);
  const isAd = MODAL_TYPES.includes(notification.type as NotificationType);

  // Résoudre l'URL de l'image (peut être à la racine ou dans data)
  const imageUrl = notification.imageUrl || notification.data?.imageUrl;

  const modalContent = (
    <div
      className={`notif-modal-overlay ${isOpen ? 'notif-modal-overlay-open' : 'notif-modal-overlay-closed'}`}
      onClick={handleClose}
    >
      <div
        className={`notif-modal-box ${isOpen ? 'notif-modal-box-open' : 'notif-modal-box-closed'}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close */}
        <button onClick={handleClose} className="notif-modal-close" aria-label="Fermer">
          <XMarkIcon className="w-4 h-4" />
        </button>

        {/* ── AD / PROMO layout ── */}
        {isAd ? (
          <>
            {/* Image pleine largeur */}
            {imageUrl && (
              <div className="notif-modal-img">
                <Image
                  src={imageUrl}
                  alt={notification.title}
                  fill
                  style={{ objectFit: 'cover' }}
                  priority
                  unoptimized
                />
                <div className="notif-modal-img-fade" />
                <div className="notif-modal-img-badge">
                  <div className={`notif-modal-type-icon ${cls}`} style={{ width: '2rem', height: '2rem' }}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span>{label}</span>
                </div>
              </div>
            )}

            <div className="notif-modal-body">
              {!notification.isRead && (
                <div className="notif-modal-unread-pill" style={{ marginBottom: '0.75rem' }}>
                  <span className="notif-modal-unread-pulse" />
                  Non lue
                </div>
              )}

              <h3 className="notif-modal-title">{notification.title}</h3>
              <p className="notif-modal-message" style={{ marginBottom: '1rem' }}>
                {notification.message}
              </p>

              {(notification.data?.discountPercentage || notification.data?.discountCode) && (
                <div className="notif-modal-ad-promo-block">
                  {notification.data?.discountPercentage && (
                    <div className="notif-modal-ad-discount">
                      <TagIcon className="w-5 h-5" />
                      <span>-{notification.data.discountPercentage}% de réduction</span>
                    </div>
                  )}
                  {notification.data?.discountCode && (
                    <div className="notif-modal-ad-code-row">
                      <span className="notif-modal-ad-code-label">Code promo</span>
                      <code className="notif-modal-ad-code">{notification.data.discountCode}</code>
                    </div>
                  )}
                </div>
              )}

              {notification.data?.validUntil && (
                <div className="notif-modal-ad-expiry">
                  <CalendarIcon className="w-3.5 h-3.5" />
                  <span>Valable jusqu'au <strong>{formatExpiry(notification.data.validUntil)}</strong></span>
                </div>
              )}

              <div className="notif-modal-footer">
                <CalendarIcon className="w-3 h-3" />
                <span>Reçu le {formatFull(notification.createdAt)}</span>
              </div>

              <div className="notif-modal-actions">
                <button onClick={handleClose} className="notif-modal-btn-primary" style={{ flex: 1 }}>
                  Fermer
                </button>
              </div>
            </div>
          </>
        ) : (
          /* ── Autres types ── */
          <>
            {imageUrl && (
              <div className="notif-modal-img">
                <Image src={imageUrl} alt={notification.title} fill style={{ objectFit: 'cover' }} priority unoptimized />
                <div className="notif-modal-img-fade" />
              </div>
            )}

            <div className="notif-modal-body">
              <div className="notif-modal-type-row">
                <div className={`notif-modal-type-icon ${cls}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="notif-modal-type-meta">
                  <p className="notif-modal-type-label">{label}</p>
                  {!notification.isRead && (
                    <div className="notif-modal-unread-pill">
                      <span className="notif-modal-unread-pulse" />
                      Non lue
                    </div>
                  )}
                </div>
              </div>

              <h3 className="notif-modal-title">{notification.title}</h3>
              <p className="notif-modal-message">{notification.message}</p>

              <div className="notif-modal-footer">
                <CalendarIcon className="w-3 h-3" />
                <span>{formatFull(notification.createdAt)}</span>
              </div>

              <div className="notif-modal-actions">
                <button onClick={handleClose} className="notif-modal-btn-secondary">Fermer</button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );

  // Portal → rendu directement dans <body>, jamais piégé dans un parent positionné
  return createPortal(modalContent, document.body);
}