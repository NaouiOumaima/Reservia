// app/admin/users/page.tsx

'use client';

import { useEffect, useState } from 'react';
import { User } from '@/types';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'client' | 'provider' | 'admin'>('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    // Simulated data - replace with API call
    setLoading(false);
  }, []);

  const filteredUsers = users.filter((user) => {
    if (filter !== 'all' && user.role !== filter) return false;
    if (search && !`${user.firstName} ${user.lastName} ${user.email}`.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }
    return true;
  });

  const banUser = (userId: string) => {
    if (confirm('Êtes-vous sûr de vouloir bannir cet utilisateur ?')) {
      setUsers(users.map(u => u._id === userId ? { ...u, isBanned: true } : u));
    }
  };

  const changeRole = (userId: string, newRole: User['role']) => {
    setUsers(users.map(u => u._id === userId ? { ...u, role: newRole } : u));
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">
            Gestion des utilisateurs
          </h1>
          <p className="text-gray-400 mt-1">
            Gérer les comptes (bannir, changer rôles)
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 space-y-4 md:space-y-0">
          <div className="flex space-x-2">
            {(['all', 'client', 'provider', 'admin'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === f
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                {f === 'all' ? 'Tous' : f === 'client' ? 'Clients' : f === 'provider' ? 'Fournisseurs' : 'Admins'}
              </button>
            ))}
          </div>
          <input
            type="text"
            placeholder="Rechercher..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400"
          />
        </div>

        {/* Users Table */}
        <div className="bg-gray-800 rounded-lg shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-gray-400">Aucun utilisateur trouvé</p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Utilisateur
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Rôle
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Inscrit le
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {filteredUsers.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-700/50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium">
                          {user.firstName?.[0]}{user.lastName?.[0]}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-white">
                            {user.firstName} {user.lastName}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        user.role === 'admin' ? 'bg-red-900 text-red-200' :
                        user.role === 'provider' ? 'bg-green-900 text-green-200' :
                        'bg-blue-900 text-blue-200'
                      }`}>
                        {user.role === 'admin' ? 'Admin' : user.role === 'provider' ? 'Fournisseur' : 'Client'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString('fr-FR') : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex space-x-2">
                        <select
                          value={user.role}
                          onChange={(e) => changeRole(user._id, e.target.value as User['role'])}
                          className="px-2 py-1 bg-gray-700 text-white rounded text-xs"
                        >
                          <option value="client">Client</option>
                          <option value="provider">Fournisseur</option>
                          <option value="admin">Admin</option>
                        </select>
                        <button
                          onClick={() => banUser(user._id)}
                          className="px-2 py-1 bg-red-900 text-red-200 rounded text-xs hover:bg-red-800"
                        >
                          Bannir
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}