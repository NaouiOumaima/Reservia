// frontend/components/RealtimeNotificationCenter.tsx
'use client';

import { useNotifications } from '@/app/components/NotificationBell';
import { useState } from 'react';

export default function RealtimeNotificationCenter() {
  const {
    notifications,
    isConnected,
    unreadCount,
    markAsRead,
    clearNotifications,
    loading,
  } = useNotifications(); // Plus besoin de passer userId !
  
  const [showPanel, setShowPanel] = useState(false);

  // Pas besoin de useEffect pour récupérer l'utilisateur - le contexte gère tout

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
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
        {isConnected && (
          <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></span>
        )}
      </button>

      {/* Notification Panel */}
      {showPanel && (
        <>
          <div 
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setShowPanel(false)}
          />
          
          <div className="absolute bottom-16 right-0 w-96 max-w-[calc(100vw-2rem)] bg-white rounded-lg shadow-xl border border-gray-200 max-h-[80vh] overflow-hidden flex flex-col z-50">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-lg">Mes notifications</h3>
                {!isConnected && (
                  <p className="text-xs text-blue-100 mt-1">Mode hors ligne - mise à jour périodique</p>
                )}
              </div>
              <button
                onClick={() => setShowPanel(false)}
                className="text-white hover:text-gray-200"
              >
                ✕
              </button>
            </div>

            {/* Connection Status */}
            <div className={`px-4 py-2 border-b text-xs ${
              isConnected ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'
            }`}>
              {isConnected ? (
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  ✓ Connecté - notifications en temps réel
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></span>
                  ⟳ Reconnexion... (mise à jour automatique)
                </span>
              )}
            </div>

            {/* Notifications List */}
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="p-8 text-center text-gray-500">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3"></div>
                  <p>Chargement de vos notifications...</p>
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <p className="text-4xl mb-2">📭</p>
                  <p className="text-lg">Aucune notification</p>
                  <p className="text-sm mt-2">Vous êtes à jour ! 🎉</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {notifications.map((notif) => (
                    <div
                      key={notif._id}
                      className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                        !notif.isRead ? 'border-l-4 border-blue-600 bg-blue-50/30' : ''
                      }`}
                      onClick={() => !notif.isRead && markAsRead(notif._id)}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <h4 className={`text-sm ${!notif.isRead ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
                          {notif.title}
                        </h4>
                        <span className="text-xs text-gray-400 ml-2 flex-shrink-0">
                          {new Date(notif.createdAt).toLocaleString('fr-FR', { 
                            hour: '2-digit', 
                            minute: '2-digit',
                            day: '2-digit',
                            month: '2-digit'
                          })}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        {notif.message}
                      </p>
                      {!notif.isRead && (
                        <div className="mt-2 inline-flex items-center gap-1">
                          <span className="w-1.5 h-1.5 bg-blue-600 rounded-full"></span>
                          <span className="text-xs text-blue-600">Non lu</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && !loading && (
              <div className="bg-gray-50 border-t p-3 flex gap-2">
                <button
                  onClick={() => markAsRead()}
                  className="flex-1 px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  disabled={unreadCount === 0}
                >
                  Tout marquer lu ({unreadCount})
                </button>
                <button
                  onClick={clearNotifications}
                  className="flex-1 px-3 py-2 text-sm bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                >
                  Effacer les lus
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}