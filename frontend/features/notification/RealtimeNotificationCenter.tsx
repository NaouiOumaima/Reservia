'use client';

import { useEffect, useState } from 'react';
import { useNotifications } from '@/features/auth/hooks/useNotifications';

export default function RealtimeNotificationCenter() {
  const [userId, setUserId] = useState<string | null>(null);
  const {
    notifications,
    isConnected,
    unreadCount,
    markAsRead,
    clearNotifications,
  } = useNotifications(userId);
  const [showPanel, setShowPanel] = useState(false);

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      try {
        const parsedUser = JSON.parse(user);
        setUserId(parsedUser.id);
      } catch (error) {
        console.error('Failed to parse user:', error);
      }
    }
  }, []);

  return (
    <div className="fixed bottom-20 right-4 z-30">
      {/* Notification Bell */}
      <button
        onClick={() => setShowPanel(!showPanel)}
        className="relative w-12 h-12 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 flex items-center justify-center"
      >
        🔔
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
        {isConnected && (
          <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></span>
        )}
      </button>

      {/* Notification Panel */}
      {showPanel && (
        <div className="absolute bottom-16 right-0 w-80 bg-white rounded-lg shadow-xl border border-gray-200 max-h-96 overflow-hidden flex flex-col">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 flex justify-between items-center">
            <h3 className="font-bold text-lg">Notifications</h3>
            <button
              onClick={() => setShowPanel(false)}
              className="text-white hover:text-gray-200"
            >
              ✕
            </button>
          </div>

          {/* Connection Status */}
          <div className="px-4 py-2 bg-gray-50 border-b text-sm">
            {isConnected ? (
              <span className="text-green-600 font-semibold">
                ✓ Connected (Real-time)
              </span>
            ) : (
              <span className="text-yellow-600 font-semibold">
                ⟳ Connecting...
              </span>
            )}
          </div>

          {/* Notifications List */}
          <div className="flex-1 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <p className="text-lg">No notifications yet</p>
                <p className="text-sm mt-2">You're all caught up! 🎉</p>
              </div>
            ) : (
              <div className="space-y-0 divide-y">
                {notifications.map((notif, idx) => (
                  <div
                    key={idx}
                    className="p-4 hover:bg-gray-50 cursor-pointer transition-colors border-l-4 border-blue-600"
                  >
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="font-semibold text-gray-900 text-sm">
                        {notif.data?.title || notif.type?.replace('_', ' ')}
                      </h4>
                      <span className="text-xs text-gray-400">
                        {notif.data?.timestamp
                          ? new Date(notif.data.timestamp).toLocaleTimeString()
                          : 'Now'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      {notif.data?.message || JSON.stringify(notif.data)}
                    </p>
                    {notif.type === 'reservation_update' && (
                      <div className="mt-2 inline-block px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                        {notif.data?.status || 'Updated'}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="bg-gray-50 border-t p-3 flex gap-2">
              <button
                onClick={() => {
                  markAsRead();
                  setShowPanel(false);
                }}
                className="flex-1 px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Mark All as Read
              </button>
              <button
                onClick={clearNotifications}
                className="flex-1 px-3 py-1 text-sm bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
              >
                Clear All
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
