// frontend/app/admin/users/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { usersApi } from '@/lib/api';
import { User } from '@/lib/api/users/types';
import { useAuth } from '@/providers/AuthProvider';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'client' | 'provider'>('all');
  const [search, setSearch] = useState('');
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);
  const { user: currentUser } = useAuth();

  useEffect(() => {
    loadUsers();
  }, [filter]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const filterRole = filter !== 'all' ? filter : undefined;
      let fetchedUsers = await usersApi.getAllUsers(filterRole);
      
      if (currentUser?._id) {
        fetchedUsers = fetchedUsers.filter(user => user._id !== currentUser._id);
      }
      
      setUsers(fetchedUsers || []);
    } catch (err: any) {
      console.error('Error loading users:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Erreur lors du chargement des utilisateurs';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleBanUser = async (userId: string) => {
    if (userId === currentUser?._id) {
      alert('Vous ne pouvez pas bannir votre propre compte !');
      return;
    }

    if (!confirm('Êtes-vous sûr de vouloir bannir cet utilisateur ?')) return;

    try {
      setUpdatingUserId(userId);
      const updatedUser = await usersApi.banUser(userId);
      setUsers(users.map(u => u._id === userId ? updatedUser : u));
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Erreur lors du bannissement';
      alert(errorMessage);
    } finally {
      setUpdatingUserId(null);
    }
  };

  const handleUnbanUser = async (userId: string) => {
    if (userId === currentUser?._id) {
      alert('Opération non autorisée sur votre propre compte !');
      return;
    }

    if (!confirm('Êtes-vous sûr de vouloir réactiver cet utilisateur ?')) return;

    try {
      setUpdatingUserId(userId);
      const updatedUser = await usersApi.unbanUser(userId);
      setUsers(users.map(u => u._id === userId ? updatedUser : u));
    } finally {
      setUpdatingUserId(null);
    }
  };

  const handleChangeRole = async (userId: string, newRole: string) => {
    if (userId === currentUser?._id) {
      alert('Vous ne pouvez pas modifier votre propre rôle !');
      return;
    }

    try {
      setUpdatingUserId(userId);
      const updatedUser = await usersApi.updateUserRole(userId, newRole);
      setUsers(users.map(u => u._id === userId ? updatedUser : u));
    } finally {
      setUpdatingUserId(null);
    }
  };

  const getInitials = (firstName?: string, lastName?: string) => {
    const first = firstName?.[0] || '';
    const last = lastName?.[0] || '';
    return (first + last).toUpperCase();
  };

  const formatDate = (date?: Date) => {
    if (!date) return 'N/A';
    try {
      return new Date(date).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return 'Date invalide';
    }
  };

  const filteredUsers = users.filter((user) => {
    if (search) {
      const searchLower = search.toLowerCase();
      const fullName = `${user.firstName} ${user.lastName} ${user.email}`.toLowerCase();
      return fullName.includes(searchLower);
    }
    return true;
  });

  const stats = {
    total: users.length,
    clients: users.filter(u => u.role === 'client').length,
    providers: users.filter(u => u.role === 'provider').length,
    banned: users.filter(u => u.isBanned).length,
    active: users.filter(u => !u.isBanned).length,
  };

  if (loading && users.length === 0) {
    return (
      <div className="admin-users-loading">
        <div className="text-center">
          <div className="spinner"></div>
          <p className="mt-4 text-muted">Chargement des utilisateurs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-users-page">
      <div className="admin-users-container">
        {/* Header */}
        <div className="admin-users-header">
          <h1 className="admin-users-title">Gestion des utilisateurs</h1>
          <p className="admin-users-subtitle">
            Gérez les comptes clients et fournisseurs
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="alert alert-error mb-6">
            <span>⚠️</span>
            <p className="flex-1">{error}</p>
            <button onClick={loadUsers} className="btn btn-sm btn-primary">
              Réessayer
            </button>
          </div>
        )}

        {/* Stats Cards */}
        <div className="admin-users-stats">
          <div className="admin-users-stat-card">
            <div className="admin-users-stat-value primary">{stats.total}</div>
            <div className="admin-users-stat-label">Total</div>
          </div>
          <div className="admin-users-stat-card">
            <div className="admin-users-stat-value blue">{stats.clients}</div>
            <div className="admin-users-stat-label">Clients</div>
          </div>
          <div className="admin-users-stat-card">
            <div className="admin-users-stat-value green">{stats.providers}</div>
            <div className="admin-users-stat-label">Fournisseurs</div>
          </div>
          <div className="admin-users-stat-card">
            <div className="admin-users-stat-value green">{stats.active}</div>
            <div className="admin-users-stat-label">Actifs</div>
          </div>
          <div className="admin-users-stat-card">
            <div className="admin-users-stat-value red">{stats.banned}</div>
            <div className="admin-users-stat-label">Bannis</div>
          </div>
        </div>

        {/* Filters */}
        <div className="admin-users-filters">
          <div className="admin-users-filter-buttons">
            <button
              onClick={() => setFilter('all')}
              className={`admin-users-filter-btn ${filter === 'all' ? 'active' : ''}`}
            >
              Tous
            </button>
            <button
              onClick={() => setFilter('client')}
              className={`admin-users-filter-btn ${filter === 'client' ? 'active' : ''}`}
            >
              Clients
            </button>
            <button
              onClick={() => setFilter('provider')}
              className={`admin-users-filter-btn ${filter === 'provider' ? 'active' : ''}`}
            >
              Fournisseurs
            </button>
          </div>
          <div className="admin-users-search">
            <span className="admin-users-search-icon">🔍</span>
            <input
              type="text"
              placeholder="Rechercher..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="admin-users-search-input"
            />
          </div>
        </div>

        {/* Table */}
        <div className="admin-users-table-container">
          {filteredUsers.length === 0 ? (
            <div className="admin-users-empty">
              <div className="admin-users-empty-icon">👥</div>
              <div className="admin-users-empty-title">Aucun utilisateur</div>
              <div className="admin-users-empty-text">
                {search ? 'Aucun résultat pour cette recherche' : 'Aucun utilisateur à afficher'}
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="admin-users-table">
                <thead>
                  <tr>
                    <th>Utilisateur</th>
                    <th>Rôle</th>
                    <th>Email</th>
                    <th>Statut</th>
                    <th>Inscrit le</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user._id}>
                      <td data-label="Utilisateur">
                        <div className="admin-users-user-cell">
                          <div className={`admin-users-avatar ${user.role === 'admin' ? 'admin-users-avatar-default' : ''}`}>
                            {getInitials(user.firstName, user.lastName)}
                          </div>
                          <div>
                            <div className="admin-users-user-name">
                              {user.firstName} {user.lastName}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td data-label="Rôle">
                        <span className={`admin-users-role-badge ${
                          user.role === 'admin' ? 'admin-users-role-admin' :
                          user.role === 'provider' ? 'admin-users-role-provider' :
                          'admin-users-role-client'
                        }`}>
                          {user.role === 'admin' ? 'Admin' : user.role === 'provider' ? 'Fournisseur' : 'Client'}
                        </span>
                      </td>
                      <td data-label="Email">
                        <span className="text-sm text-muted">{user.email}</span>
                      </td>
                      <td data-label="Statut">
                        <span className={`admin-users-status-badge ${
                          user.isBanned ? 'admin-users-status-banned' : 'admin-users-status-active'
                        }`}>
                          <span className={`admin-users-status-dot ${user.isBanned ? 'banned' : 'active'}`}></span>
                          {user.isBanned ? 'Banni' : 'Actif'}
                        </span>
                      </td>
                      <td data-label="Inscrit le">
                        <span className="text-sm text-muted">{formatDate(user.createdAt)}</span>
                      </td>
                      <td data-label="Actions">
                        {user._id !== currentUser?._id ? (
                          <div className="admin-users-actions">
                            <select
                              value={user.role}
                              onChange={(e) => handleChangeRole(user._id, e.target.value)}
                              disabled={updatingUserId === user._id}
                              className="admin-users-select"
                            >
                              <option value="client">Client</option>
                              <option value="provider">Fournisseur</option>
                              <option value="admin">Admin</option>
                            </select>
                            {user.isBanned ? (
                              <button
                                onClick={() => handleUnbanUser(user._id)}
                                disabled={updatingUserId === user._id}
                                className="admin-users-unban-btn"
                              >
                                Réactiver
                              </button>
                            ) : (
                              <button
                                onClick={() => handleBanUser(user._id)}
                                disabled={updatingUserId === user._id}
                                className="admin-users-ban-btn"
                              >
                                Bannir
                              </button>
                            )}
                          </div>
                        ) : (
                          <span className="admin-users-protected">🔒 Protégé</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}