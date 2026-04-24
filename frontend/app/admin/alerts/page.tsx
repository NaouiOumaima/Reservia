// app/admin/alerts/page.tsx

'use client';

import { useEffect, useState } from 'react';

interface Alert {
  id: string;
  timestamp: Date;
  type: 'cache' | 'api' | 'database' | 'system';
  severity: 'info' | 'warning' | 'critical';
  message: string;
  isResolved: boolean;
}

export default function AdminAlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulated data - replace with API call
    setAlerts([
      {
        id: '1',
        timestamp: new Date(),
        type: 'cache',
        severity: 'info',
        message: 'Cache Redis: Utilisation à 45%',
        isResolved: true,
      },
      {
        id: '2',
        timestamp: new Date(),
        type: 'api',
        severity: 'warning',
        message: 'API IA: Temps de réponse élevé (2.5s)',
        isResolved: false,
      },
    ]);
    setLoading(false);
  }, []);

  const resolveAlert = (alertId: string) => {
    setAlerts(alerts.map(a => a._id === alertId ? { ...a, isResolved: true } : a));
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-400 bg-red-900/20 border-red-700';
      case 'warning': return 'text-yellow-400 bg-yellow-900/20 border-yellow-700';
      case 'info': return 'text-blue-400 bg-blue-900/20 border-blue-700';
      default: return 'text-gray-400 bg-gray-800 border-gray-700';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'cache': return '💾';
      case 'api': return '🔗';
      case 'database': return '🗄️';
      case 'system': return '⚙️';
      default: return '📢';
    }
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">
            Alertes système
          </h1>
          <p className="text-gray-400 mt-1">
            Alertes techniques (cache Redis, API IA)
          </p>
        </div>

        {/* Active Alerts */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-white mb-4">Alertes actives</h2>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : alerts.filter(a => !a.isResolved).length === 0 ? (
            <div className="bg-gray-800 rounded-lg p-8 text-center">
              <div className="text-4xl mb-2">✓</div>
              <p className="text-gray-400">Aucune alerte active</p>
            </div>
          ) : (
            <div className="space-y-4">
              {alerts.filter(a => !a.isResolved).map((alert) => (
                <div
                  key={alert.id}
                  className={`rounded-lg p-6 border ${getSeverityColor(alert.severity)}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <span className="text-2xl">{getTypeIcon(alert.type)}</span>
                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            alert.severity === 'critical' ? 'bg-red-900 text-red-200' :
                            alert.severity === 'warning' ? 'bg-yellow-900 text-yellow-200' :
                            'bg-blue-900 text-blue-200'
                          }`}>
                            {alert.severity.toUpperCase()}
                          </span>
                          <span className="text-sm text-gray-400">
                            {alert.timestamp.toLocaleString('fr-FR')}
                          </span>
                        </div>
                        <p className="text-white">{alert.message}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => resolveAlert(alert.id)}
                      className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600"
                    >
                      Résoudre
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Resolved Alerts */}
        <div>
          <h2 className="text-xl font-bold text-white mb-4">Alertes résolues</h2>
          {alerts.filter(a => a.isResolved).length === 0 ? (
            <div className="bg-gray-800 rounded-lg p-8 text-center">
              <p className="text-gray-400">Aucune alerte résolue</p>
            </div>
          ) : (
            <div className="space-y-4">
              {alerts.filter(a => a.isResolved).map((alert) => (
                <div
                  key={alert.id}
                  className="bg-gray-800 rounded-lg p-6 border border-gray-700 opacity-60"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{getTypeIcon(alert.type)}</span>
                      <div>
                        <p className="text-gray-400">{alert.message}</p>
                        <span className="text-sm text-gray-500">
                          Résolu le {alert.timestamp.toLocaleString('fr-FR')}
                        </span>
                      </div>
                    </div>
                    <span className="text-green-400">✓ Résolu</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* System Status */}
        <div className="mt-8 bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-bold text-white mb-4">État des services</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 bg-green-500 rounded-full"></span>
              <span className="text-gray-300">API REST</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 bg-green-500 rounded-full"></span>
              <span className="text-gray-300">WebSocket</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 bg-green-500 rounded-full"></span>
              <span className="text-gray-300">Database</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 bg-yellow-500 rounded-full"></span>
              <span className="text-gray-300">AI Service</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}