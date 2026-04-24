// app/admin/logs/page.tsx

'use client';

import { useEffect, useState } from 'react';

interface LogEntry {
  id: string;
  timestamp: Date;
  level: 'info' | 'warning' | 'error';
  message: string;
  source: string;
}

export default function AdminLogsPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'info' | 'warning' | 'error'>('all');

  useEffect(() => {
    // Simulated data - replace with API call
    setLogs([
      { id: '1', timestamp: new Date(), level: 'info', message: 'API request successful', source: 'auth' },
      { id: '2', timestamp: new Date(), level: 'warning', message: 'High memory usage detected', source: 'system' },
      { id: '3', timestamp: new Date(), level: 'error', message: 'Database connection timeout', source: 'database' },
    ]);
    setLoading(false);
  }, []);

  const filteredLogs = logs.filter((log) => {
    if (filter === 'all') return true;
    return log.level === filter;
  });

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'error': return 'text-red-400 bg-red-900/20';
      case 'warning': return 'text-yellow-400 bg-yellow-900/20';
      case 'info': return 'text-blue-400 bg-blue-900/20';
      default: return 'text-gray-400 bg-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">
            Logs & monitoring
          </h1>
          <p className="text-gray-400 mt-1">
            Erreurs (Sentry) et performances
          </p>
        </div>

        {/* Filters */}
        <div className="flex space-x-2 mb-6">
          {(['all', 'info', 'warning', 'error'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === f
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              {f === 'all' ? 'Tous' : f === 'info' ? 'Info' : f === 'warning' ? 'Avertissements' : 'Erreurs'}
            </button>
          ))}
        </div>

        {/* Logs Table */}
        <div className="bg-gray-800 rounded-lg shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-gray-400">Aucun log trouvé</p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Timestamp
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Niveau
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Message
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Source
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-700/50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {log.timestamp.toLocaleString('fr-FR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${getLevelColor(log.level)}`}>
                        {log.level.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-300">
                      {log.message}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                      {log.source}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* External Links */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <a
            href="#"
            className="bg-gray-800 rounded-lg p-6 hover:bg-gray-700 transition-colors"
          >
            <h3 className="font-semibold text-white mb-2">Sentry</h3>
            <p className="text-sm text-gray-400">Voir les erreurs sur Sentry →</p>
          </a>
          <a
            href="#"
            className="bg-gray-800 rounded-lg p-6 hover:bg-gray-700 transition-colors"
          >
            <h3 className="font-semibold text-white mb-2">Metrics</h3>
            <p className="text-sm text-gray-400">Voir les métriques de performance →</p>
          </a>
        </div>
      </div>
    </div>
  );
}