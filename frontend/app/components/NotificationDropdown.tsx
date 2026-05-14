// frontend/components/NotificationDropdown.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import { BellIcon } from '@/components/ui/Icons';
import Link from 'next/link';
import Image from 'next/image';
import { useNotifications } from './NotificationBell';

export default function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { notifications, unreadCount, markAsRead, loading } = useNotifications();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' });
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'reservation_confirmed':
        return '✅';
      case 'reservation_reminder':
        return '⏰';
      case 'reservation_cancelled':
        return '❌';
      case 'advertisement':
        return '📢';
      case 'promotion':
        return '🎉';
      default:
        return '🔔';
    }
  };

  const handleNotificationClick = async (notification: any) => {
    if (!notification.isRead) {
      await markAsRead(notification._id);
    }
    setIsOpen(false);
  };

  const displayedNotifications = notifications.slice(0, 5);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full hover:bg-gray-700 transition-colors"
      >
        <BellIcon className="w-6 h-6 text-gray-300" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-gray-800 rounded-lg shadow-xl z-50 border border-gray-700">
          <div className="p-3 border-b border-gray-700 flex justify-between items-center">
            <h3 className="font-semibold text-white">Notifications</h3>
            <Link
              href="/notifications"
              onClick={() => setIsOpen(false)}
              className="text-xs text-blue-400 hover:text-blue-300"
            >
              Voir tout
            </Link>
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              </div>
            ) : displayedNotifications.length === 0 ? (
              <div className="p-8 text-center text-gray-400">
                <BellIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Aucune notification</p>
              </div>
            ) : (
              displayedNotifications.map((notification) => (
                <Link
                  key={notification._id}
                  href={notification.actionUrl || '/notifications'}
                  onClick={() => handleNotificationClick(notification)}
                  className="block p-3 hover:bg-gray-700 cursor-pointer border-b border-gray-700 transition-colors"
                >
                  <div className="flex gap-3">
                    <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center text-xl flex-shrink-0">
                      {notification.imageUrl ? (
                        <Image
                          src={notification.imageUrl}
                          alt=""
                          width={40}
                          height={40}
                          className="rounded-full object-cover"
                        />
                      ) : (
                        <span>{getNotificationIcon(notification.type)}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-white text-sm truncate">
                        {notification.title}
                      </div>
                      <div className="text-xs text-gray-400 mt-1 line-clamp-2">
                        {notification.message}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {formatDate(notification.createdAt)}
                      </div>
                    </div>
                    {!notification.isRead && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    )}
                  </div>
                </Link>
              ))
            )}
          </div>
          
          {notifications.length > 5 && (
            <div className="p-2 border-t border-gray-700 text-center">
              <Link
                href="/notifications"
                onClick={() => setIsOpen(false)}
                className="text-xs text-blue-400 hover:text-blue-300"
              >
                Voir toutes ({notifications.length})
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}