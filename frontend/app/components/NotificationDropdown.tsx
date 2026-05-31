// frontend/components/NotificationDropdown.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { BellIcon } from '@/components/ui/Icons';
import Link from 'next/link';
import Image from 'next/image';
import { useNotifications } from './NotificationBell';

export default function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const { notifications, unreadCount, markAsRead, loading } = useNotifications();

  // Détecter mobile au montage et au resize
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Fermer au clic extérieur — desktop uniquement
  useEffect(() => {
    if (!isOpen || isMobile) return; // sur mobile, l'overlay gère ça
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (dropdownRef.current?.contains(target)) return;
      if (buttonRef.current?.contains(target)) return;
      setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobile, isOpen]);

  // Bloquer le scroll du body quand ouvert sur mobile
  useEffect(() => {
    if (isOpen && isMobile) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen, isMobile]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "À l'instant";
    if (minutes < 60) return `Il y a ${minutes} min`;
    if (hours < 24) return `Il y a ${hours} h`;
    if (days < 7) return `Il y a ${days} j`;
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' });
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'reservation_confirmed': return '✅';
      case 'reservation_reminder':  return '⏰';
      case 'reservation_cancelled': return '❌';
      case 'advertisement':         return '📢';
      case 'promotion':             return '🎉';
      default:                      return '🔔';
    }
  };

  const handleNotificationClick = async (notification: any) => {
    if (!notification.isRead) {
      await markAsRead(notification._id);
    }
    setIsOpen(false);
  };

  const displayedNotifications = notifications.slice(0, 5);
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const updateDropdownPosition = () => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const width = Math.min(380, window.innerWidth - 32);
    const left = Math.min(Math.max(rect.left, 16), window.innerWidth - width - 16);

    setDropdownStyle({
      position: 'fixed',
      top: rect.bottom + 8,
      left,
      width,
      zIndex: 999,
      maxHeight: '70vh',
      borderRadius: 'var(--radius-xl)',
      animation: 'notifFadeDown 0.22s ease-out',
    });
  };

  useEffect(() => {
    if (!isOpen) return;
    if (isMobile) return;
    updateDropdownPosition();
    const handleResize = () => updateDropdownPosition();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isOpen, isMobile]);

  const panelStyle: React.CSSProperties = isMobile
    ? {
        position: 'fixed',
        top: '5rem',
        left: '50%',
        transform: 'translateX(-50%)',
        width: 'calc(100% - 2rem)',
        maxWidth: '100%',
        maxHeight: '80vh',
        zIndex: 999,
        borderRadius: 'var(--radius-xl)',
        animation: 'notifFadeDown 0.22s ease-out',
      }
    : dropdownStyle;

  const dropdownPane = (
    <>
      {/* ── Overlay (mobile = plein écran, desktop = invisible) ── */}
      <div
        onClick={() => setIsOpen(false)}
        aria-hidden="true"
        style={{
          position: 'fixed',
          inset: 0,
          background: 'transparent',
          zIndex: 998,
          animation: 'fadeIn 0.2s ease-out',
        }}
      />

      {/* ── Dropdown panel ── */}
      <div
        ref={dropdownRef}
        className="notification-dropdown"
        role="dialog"
        aria-label="Notifications"
        style={panelStyle}
      >
        {/* Header */}
        <div className="notification-dropdown-header">
          <h3 className="notification-dropdown-title">Notifications</h3>
          <Link
            href="/notifications"
            onClick={() => setIsOpen(false)}
            className="notification-dropdown-link"
          >
            Voir tout
          </Link>
        </div>

        {/* Liste */}
        <div className="notification-dropdown-list">
          {loading ? (
            <div className="notification-dropdown-loading">
              <div className="spinner-sm" />
              <p className="text-muted text-sm mt-3">Chargement...</p>
            </div>
          ) : displayedNotifications.length === 0 ? (
            <div className="notification-dropdown-empty">
              Aucune notification pour le moment.
            </div>
          ) : (
            displayedNotifications.map((notification) => (
              <button
                key={notification._id}
                type="button"
                onClick={() => handleNotificationClick(notification)}
                className={`notification-dropdown-item ${
                  !notification.isRead ? 'notification-dropdown-item-unread' : ''
                }`}
              >
                <div className="notification-dropdown-item-icon">
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="notification-dropdown-item-content">
                  <div
                    className={`notification-dropdown-item-title ${
                      !notification.isRead ? 'text-semibold' : ''
                    }`}
                  >
                    {notification.title}
                  </div>
                  <div className="notification-dropdown-item-message">
                    {notification.message}
                  </div>
                </div>
                <div className="notification-dropdown-item-date">
                  {formatDate(notification.createdAt)}
                </div>
                <div className="notification-dropdown-item-dot" />
              </button>
            ))
          )}
        </div>

        <div className="notification-dropdown-footer">
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="notification-dropdown-footer-link"
          >
            Fermer
          </button>
        </div>
      </div>
    </>
  );

  return (
    /* ── Wrapper — position: relative uniquement sur desktop ── */
    <div
      ref={dropdownRef}
      style={{ position: isMobile ? 'static' : 'relative', display: 'inline-block' }}
    >
      {/* ── Bouton cloche ── */}
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="notification-dropdown-btn"
        aria-label="Notifications"
        aria-expanded={isOpen}
      >
        <BellIcon className="icon-md" />
        {unreadCount > 0 && (
          <span className="notification-badge-count">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isMounted && isOpen && createPortal(dropdownPane, document.body)}
    </div>
  );
}