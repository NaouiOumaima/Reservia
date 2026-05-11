'use client';

import { useEffect, useState } from 'react';
import { usersApi } from '@/lib/api';
import { User } from '@/lib/api/users/types';
import { useAuth } from '@/providers/AuthProvider';
import {
  EyeIcon,
  BanIcon,          // ou ShieldOffIcon selon votre Icons.tsx
  CheckCircleIcon,
  XMarkIcon,
  UserIcon,
  PhoneIcon,
  EnvelopeIcon,
  CalendarIcon,
  MapPinIcon,
  BuildingOfficeIcon,
  ShieldCheckIcon,
} from '@/components/ui/Icons'; // ← adaptez le chemin à votre Icons.tsx

// ---------------------------------------------------------------------------
// UserDetailModal
// ---------------------------------------------------------------------------
function UserDetailModal({
  user,
  onClose,
}: {
  user: User | null;
  onClose: () => void;
}) {
  if (!user) return null;

  const formatDate = (date?: Date | string) => {
    if (!date) return 'N/A';
    try {
      return new Date(date).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    } catch {
      return 'Date invalide';
    }
  };

  const roleLabel =
    user.role === 'admin'
      ? 'Administrateur'
      : user.role === 'provider'
      ? 'Fournisseur'
      : 'Client';

  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div
        className="admin-modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="admin-modal-header">
          <div className="admin-modal-avatar">
            {user.profileImage || user.avatar ? (
              <img
                src={user.profileImage || user.avatar}
                alt="avatar"
                className="admin-modal-avatar-img"
              />
            ) : (
              <span>
                {(user.firstName?.[0] || '') + (user.lastName?.[0] || '')}
              </span>
            )}
          </div>
          <div className="admin-modal-header-info">
            <h2>
              {user.firstName} {user.lastName}
            </h2>
            <span
              className={`admin-users-role-badge ${
                user.role === 'admin'
                  ? 'admin-users-role-admin'
                  : user.role === 'provider'
                  ? 'admin-users-role-provider'
                  : 'admin-users-role-client'
              }`}
            >
              {roleLabel}
            </span>
          </div>
          <button className="admin-modal-close" onClick={onClose}>
            <XMarkIcon size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="admin-modal-body">
          {/* Infos communes */}
          <section className="admin-modal-section">
            <h3>Informations générales</h3>
            <ul>
              <li>
                <EnvelopeIcon size={16} />
                <span>{user.email}</span>
              </li>
              {user.phone && (
                <li>
                  <PhoneIcon size={16} />
                  <span>{user.phone}</span>
                </li>
              )}
              <li>
                <CalendarIcon size={16} />
                <span>Inscrit le {formatDate(user.createdAt)}</span>
              </li>
              {user.lastLogin && (
                <li>
                  <ShieldCheckIcon size={16} />
                  <span>Dernière connexion : {formatDate(user.lastLogin)}</span>
                </li>
              )}
              <li>
                <UserIcon size={16} />
                <span>
                  Statut :{' '}
                  <strong className={user.isBanned ? 'text-red' : 'text-green'}>
                    {user.isBanned ? 'Banni' : 'Actif'}
                  </strong>
                </span>
              </li>
              <li>
                <ShieldCheckIcon size={16} />
                <span>
                  Email vérifié :{' '}
                  <strong>{user.isEmailVerified ? 'Oui' : 'Non'}</strong>
                </span>
              </li>
            </ul>
          </section>

          {/* Préférences client */}
          {user.role === 'client' && user.preferences && (
            <section className="admin-modal-section">
              <h3>Préférences</h3>
              <ul>
                {user.preferences.favoriteCategories?.length ? (
                  <li>
                    <span>Catégories favorites :</span>
                    <span>{user.preferences.favoriteCategories.join(', ')}</span>
                  </li>
                ) : null}
                {user.preferences.maxPrice != null && (
                  <li>
                    <span>Prix max :</span>
                    <span>{user.preferences.maxPrice} TND</span>
                  </li>
                )}
                {user.preferences.maxDistance != null && (
                  <li>
                    <span>Distance max :</span>
                    <span>{user.preferences.maxDistance} km</span>
                  </li>
                )}
                {user.preferences.preferredDays?.length ? (
                  <li>
                    <span>Jours préférés :</span>
                    <span>{user.preferences.preferredDays.join(', ')}</span>
                  </li>
                ) : null}
              </ul>
            </section>
          )}

          {/* Profil fournisseur */}
          {user.role === 'provider' && (user as any).providerProfile && (
            <section className="admin-modal-section">
              <h3>Profil fournisseur</h3>
              <ul>
                {(user as any).providerProfile.businessName && (
                  <li>
                    <BuildingOfficeIcon size={16} />
                    <span>{(user as any).providerProfile.businessName}</span>
                  </li>
                )}
                {(user as any).providerProfile.siret && (
                  <li>
                    <span>SIRET :</span>
                    <span>{(user as any).providerProfile.siret}</span>
                  </li>
                )}
                {(user as any).providerProfile.description && (
                  <li>
                    <span>{(user as any).providerProfile.description}</span>
                  </li>
                )}
                <li>
                  <ShieldCheckIcon size={16} />
                  <span>
                    Vérifié :{' '}
                    <strong>
                      {(user as any).providerProfile.isVerified ? 'Oui' : 'Non'}
                    </strong>
                  </span>
                </li>
              </ul>
            </section>
          )}

          {/* Localisation */}
          {(user as any).location?.address && (
            <section className="admin-modal-section">
              <h3>Localisation</h3>
              <ul>
                <li>
                  <MapPinIcon size={16} />
                  <span>
                    {(user as any).location.address},{' '}
                    {(user as any).location.city},{' '}
                    {(user as any).location.governorate}
                  </span>
                </li>
              </ul>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// AdminUsersPage
// ---------------------------------------------------------------------------
export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'client' | 'provider'>('all');
  const [search, setSearch] = useState('');
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const { user: currentUser } = useAuth();

  useEffect(() => {
    loadUsers();
  }, [filter]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const filterRole = filter !== 'all' ? filter : undefined;
      let fetched = await usersApi.getAllUsers(filterRole);
      if (currentUser?._id) {
        fetched = fetched.filter((u) => u._id !== currentUser._id);
      }
      setUsers(fetched || []);
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          err.message ||
          'Erreur lors du chargement'
      );
    } finally {
      setLoading(false);
    }
  };

  // View detail — fetch full user data from backend
  const handleViewUser = async (userId: string) => {
    try {
      const fullUser = await usersApi.getUserById(userId); // nouveau endpoint
      setSelectedUser(fullUser);
    } catch {
      // fallback: utiliser les données déjà chargées
      setSelectedUser(users.find((u) => u._id === userId) || null);
    }
  };

  const handleBanUser = async (userId: string) => {
    if (!confirm('Bannir cet utilisateur ?')) return;
    try {
      setUpdatingUserId(userId);
      const updated = await usersApi.banUser(userId);
      setUsers(users.map((u) => (u._id === userId ? updated : u)));
    } catch (err: any) {
      alert(err.response?.data?.message || err.message || 'Erreur');
    } finally {
      setUpdatingUserId(null);
    }
  };

  const handleUnbanUser = async (userId: string) => {
    if (!confirm('Réactiver cet utilisateur ?')) return;
    try {
      setUpdatingUserId(userId);
      const updated = await usersApi.unbanUser(userId);
      setUsers(users.map((u) => (u._id === userId ? updated : u)));
    } finally {
      setUpdatingUserId(null);
    }
  };

  const getInitials = (firstName?: string, lastName?: string) =>
    ((firstName?.[0] || '') + (lastName?.[0] || '')).toUpperCase();

  const formatDate = (date?: Date) => {
    if (!date) return 'N/A';
    try {
      return new Date(date).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return 'Date invalide';
    }
  };

  const filteredUsers = users.filter((user) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return `${user.firstName} ${user.lastName} ${user.email}`
      .toLowerCase()
      .includes(q);
  });

  const stats = {
    total: users.length,
    clients: users.filter((u) => u.role === 'client').length,
    providers: users.filter((u) => u.role === 'provider').length,
    banned: users.filter((u) => u.isBanned).length,
    active: users.filter((u) => !u.isBanned).length,
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

        {/* Error */}
        {error && (
          <div className="alert alert-error mb-6">
            <span>⚠️</span>
            <p className="flex-1">{error}</p>
            <button onClick={loadUsers} className="btn btn-sm btn-primary">
              Réessayer
            </button>
          </div>
        )}

        {/* Stats */}
        <div className="admin-users-stats">
          {[
            { label: 'Total', value: stats.total, color: 'primary' },
            { label: 'Clients', value: stats.clients, color: 'blue' },
            { label: 'Fournisseurs', value: stats.providers, color: 'green' },
            { label: 'Actifs', value: stats.active, color: 'green' },
            { label: 'Bannis', value: stats.banned, color: 'red' },
          ].map(({ label, value, color }) => (
            <div key={label} className="admin-users-stat-card">
              <div className={`admin-users-stat-value ${color}`}>{value}</div>
              <div className="admin-users-stat-label">{label}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="admin-users-filters">
          <div className="admin-users-filter-buttons">
            {(['all', 'client', 'provider'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`admin-users-filter-btn ${filter === f ? 'active' : ''}`}
              >
                {f === 'all' ? 'Tous' : f === 'client' ? 'Clients' : 'Fournisseurs'}
              </button>
            ))}
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
                {search
                  ? 'Aucun résultat pour cette recherche'
                  : 'Aucun utilisateur à afficher'}
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
                      {/* Utilisateur */}
                      <td data-label="Utilisateur">
                        <div className="admin-users-user-cell">
                          <div
                            className={`admin-users-avatar ${
                              user.role === 'admin'
                                ? 'admin-users-avatar-default'
                                : ''
                            }`}
                          >
                            {getInitials(user.firstName, user.lastName)}
                          </div>
                          <div>
                            <div className="admin-users-user-name">
                              {user.firstName} {user.lastName}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Rôle */}
                      <td data-label="Rôle">
                        <span
                          className={`admin-users-role-badge ${
                            user.role === 'admin'
                              ? 'admin-users-role-admin'
                              : user.role === 'provider'
                              ? 'admin-users-role-provider'
                              : 'admin-users-role-client'
                          }`}
                        >
                          {user.role === 'admin'
                            ? 'Admin'
                            : user.role === 'provider'
                            ? 'Fournisseur'
                            : 'Client'}
                        </span>
                      </td>

                      {/* Email */}
                      <td data-label="Email">
                        <span className="text-sm text-muted">{user.email}</span>
                      </td>

                      {/* Statut */}
                      <td data-label="Statut">
                        <span
                          className={`admin-users-status-badge ${
                            user.isBanned
                              ? 'admin-users-status-banned'
                              : 'admin-users-status-active'
                          }`}
                        >
                          <span
                            className={`admin-users-status-dot ${
                              user.isBanned ? 'banned' : 'active'
                            }`}
                          ></span>
                          {user.isBanned ? 'Banni' : 'Actif'}
                        </span>
                      </td>

                      {/* Date */}
                      <td data-label="Inscrit le">
                        <span className="text-sm text-muted">
                          {formatDate(user.createdAt)}
                        </span>
                      </td>

                      {/* Actions */}
                      <td data-label="Actions">
                        {user._id !== currentUser?._id ? (
                          <div className="admin-users-actions">
                            {/* Afficher */}
                            <button
                              onClick={() => handleViewUser(user._id)}
                              className="admin-users-icon-btn view"
                              title="Afficher les détails"
                              disabled={updatingUserId === user._id}
                            >
                              <EyeIcon size={17} />
                            </button>

                            {/* Bannir / Réactiver */}
                            {user.isBanned ? (
                              <button
                                onClick={() => handleUnbanUser(user._id)}
                                disabled={updatingUserId === user._id}
                                className="admin-users-icon-btn unban"
                                title="Réactiver le compte"
                              >
                                <CheckCircleIcon size={17} />
                              </button>
                            ) : (
                              <button
                                onClick={() => handleBanUser(user._id)}
                                disabled={updatingUserId === user._id}
                                className="admin-users-icon-btn ban"
                                title="Bannir le compte"
                              >
                                <BanIcon size={17} />
                              </button>
                            )}
                          </div>
                        ) : (
                          <span className="admin-users-protected">
                            🔒 Protégé
                          </span>
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

      {/* Modal */}
      {selectedUser && (
        <UserDetailModal
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
        />
      )}
    </div>
  );
}