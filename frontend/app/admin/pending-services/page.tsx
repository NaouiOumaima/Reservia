// app/admin/pending-services/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { Service } from '@/lib/api/services/types';
import { servicesApi } from '@/lib/api/services/services.api';
import { CATEGORIES, getCategoryFrenchLabel } from '@/lib/api/constants/categories.';

export default function AdminServicesListPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const data = await servicesApi.getAllAdmin();
      setServices(Array.isArray(data) ? data : []);
    } catch (error: any) {
      console.error('Erreur:', error);
      alert('Impossible de charger les services');
      setServices([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleServiceStatus = async (serviceId: string, currentStatus: boolean) => {
    try {
      await servicesApi.toggleActive(serviceId);
      setServices(services.map(s => 
        s._id === serviceId ? { ...s, isActive: !currentStatus } : s
      ));
      alert(`Service ${!currentStatus ? 'activé' : 'désactivé'}`);
    } catch (error: any) {
      alert('Erreur lors du changement de statut');
    }
  };

  const deleteService = async (serviceId: string) => {
    if (!confirm('Supprimer ce service ?')) return;
    try {
      await servicesApi.delete(serviceId);
      setServices(services.filter(s => s._id !== serviceId));
      alert('Service supprimé');
    } catch (error: any) {
      alert('Erreur lors de la suppression');
    }
  };

  const getProviderName = (service: any) => {
    if (!service.providerId) return 'Inconnu';
    if (typeof service.providerId === 'object') {
      return service.providerId.businessName || 
             `${service.providerId.firstName || ''} ${service.providerId.lastName || ''}`.trim() ||
             service.providerId.email ||
             'Inconnu';
    }
    return service.providerId;
  };

  const getCategoryColor = (categoryKey: string): string => {
    const colors: Record<string, string> = {
      'restaurant': 'bg-primary-soft text-primary',
      'hotel': 'bg-accent-soft text-accent',
      'beauté': 'bg-pink-500/10 text-pink-500',
      'fitness': 'bg-green-500/10 text-green-500',
      'medical': 'bg-red-500/10 text-red-500',
      'education': 'bg-purple-500/10 text-purple-500',
      'loisirs': 'bg-yellow-500/10 text-yellow-600',
      'transport': 'bg-indigo-500/10 text-indigo-500',
      'autre': 'bg-surface-raised text-foreground-muted',
    };
    return colors[categoryKey] || 'bg-surface-raised text-foreground-muted';
  };

  const filteredServices = services.filter(service => {
    if (filter === 'active' && !service.isActive) return false;
    if (filter === 'inactive' && service.isActive) return false;
    if (selectedCategory !== 'all' && service.category !== selectedCategory) return false;
    return true;
  });

  const stats = {
    total: services.length,
    active: services.filter(s => s.isActive).length,
    inactive: services.filter(s => !s.isActive).length,
  };

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="admin-loading-content">
          <div className="spinner"></div>
          <p className="text-muted">Chargement des services...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-users-page">
      <div className="admin-users-container">
        {/* Header */}
        <div className="admin-users-header">
          <div>
            <h1 className="admin-users-title">
              Gestion des services
            </h1>
            <p className="admin-users-subtitle">
              Consulter et gérer tous les services des fournisseurs
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="admin-users-stats">
          <div className="admin-users-stat-card">
            <div className="admin-users-stat-value primary">{stats.total}</div>
            <div className="admin-users-stat-label">Total services</div>
          </div>
          <div className="admin-users-stat-card">
            <div className="admin-users-stat-value success">{stats.active}</div>
            <div className="admin-users-stat-label">Services actifs</div>
          </div>
          <div className="admin-users-stat-card">
            <div className="admin-users-stat-value error">{stats.inactive}</div>
            <div className="admin-users-stat-label">Services inactifs</div>
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
              onClick={() => setFilter('active')}
              className={`admin-users-filter-btn ${filter === 'active' ? 'active' : ''}`}
            >
              Actifs
            </button>
            <button
              onClick={() => setFilter('inactive')}
              className={`admin-users-filter-btn ${filter === 'inactive' ? 'active' : ''}`}
            >
              Inactifs
            </button>
          </div>
          
          <div className="admin-users-search">
            <span className="admin-users-search-icon">🔍</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="admin-users-search-input"
              style={{ paddingLeft: '2.5rem' }}
            >
              <option value="all">Toutes catégories</option>
              {CATEGORIES.map(cat => (
                <option key={cat.key} value={cat.label}>
                  {cat.frenchLabel}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Services List */}
        {filteredServices.length === 0 ? (
          <div className="admin-reviews-empty">
            <div className="admin-reviews-empty-icon">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="admin-reviews-empty-title">Aucun service trouvé</h3>
            <p className="admin-reviews-empty-text">
              Aucun service ne correspond aux filtres
            </p>
          </div>
        ) : (
          <div className="admin-reviews-list">
            {filteredServices.map((service) => (
              <div key={service._id} className="review-card-modern">
                <div className="review-card-header">
                  <div className="review-card-status">
                    <span className={`badge-modern ${service.isActive ? 'success' : 'error'}`}>
                      {service.isActive ? '✓ Actif' : '✗ Inactif'}
                    </span>
                    <span className={`badge-modern ${getCategoryColor(service.category).split(' ')[0]}`}>
                      {getCategoryFrenchLabel(service.category)}
                    </span>
                  </div>
                </div>
                
                <h3 className="provider-service-title" style={{ fontSize: '1.125rem', marginBottom: '0.5rem' }}>
                  {service.name}
                </h3>
                
                <p className="review-card-comment" style={{ borderLeftColor: 'rgb(var(--primary))' }}>
                  {service.description}
                </p>
                
                <div className="review-card-meta">
                  <div className="review-card-meta-item">
                    <span>📍</span> {service.location?.city}, {service.location?.governorate}
                  </div>
                  <div className="review-card-meta-item">
                    <span>💰</span> {service.basePrice} DT
                  </div>
                  <div className="review-card-meta-item">
                    <span>⏱️</span> {service.duration} min
                  </div>
                  <div className="review-card-meta-item">
                    <span>⭐</span> {service.avgRating?.toFixed(1) || 'Nouveau'}
                  </div>
                </div>
                
                <div className="review-card-meta-item" style={{ marginBottom: '1rem' }}>
                  <span className="font-medium text-muted">Fournisseur:</span>{' '}
                  {getProviderName(service)}
                </div>

                <div className="review-card-actions">
                  <button
                    onClick={() => toggleServiceStatus(service._id, service.isActive)}
                    className={`action-btn ${service.isActive ? 'warning' : 'success'}`}
                    style={service.isActive ? { background: 'rgba(251, 191, 36, 0.1)', color: '#d97706' } : {}}
                  >
                    {service.isActive ? 'Désactiver' : 'Activer'}
                  </button>
                  
                  <button
                    onClick={() => deleteService(service._id)}
                    className="action-btn danger"
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}