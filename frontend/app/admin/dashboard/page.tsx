// app/admin/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { adminApi, AdminStats } from '@/lib/api/admin/index';
import { TUNISIAN_GOVERNORATES } from '@/lib/api/constants/governorates';
import { 
  UsersIcon, 
  BookingIcon, 
  ServicesIcon, 
  ReviewIcon,
  StarIcon,
  MapIcon
} from '@/components/ui/Icons';

export default function AdminDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedGovernorate, setSelectedGovernorate] = useState<string>('all');
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month');

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    if (user.role !== 'admin') {
      router.push('/');
      return;
    }
  }, [user, router]);

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchStats();
    }
  }, [user, timeRange]);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const data = await adminApi.getStats(timeRange);
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user || user.role !== 'admin') {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="text-center">
          <div className="spinner mx-auto"></div>
          <p className="mt-4 text-muted">Chargement des statistiques...</p>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="min-h-screen bg-surface">
      <div className="container-app py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="gradient-text text-3xl font-bold">
              Tableau de bord
            </h1>
            <p className="mt-2 text-muted">
              Bienvenue, {user.firstName} {user.lastName}
            </p>
          </div>
          <div className="flex gap-2">
            {(['week', 'month', 'year'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`time-range-btn ${timeRange === range ? 'active' : ''}`}
              >
                {range === 'week' ? 'Semaine' : range === 'month' ? 'Mois' : 'Année'}
              </button>
            ))}
          </div>
        </div>

        {/* KPIs Principaux */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="stat-card">
            <UsersIcon className="w-8 h-8 mx-auto mb-2 text-primary" />
            <div className="stat-card-value text-primary">{stats.users.total.toLocaleString()}</div>
            <div className="stat-card-label">Total utilisateurs</div>
            <div className="flex justify-center gap-3 mt-2 text-xs">
              <span className="text-accent">👤 {stats.users.clients.toLocaleString()}</span>
              <span className="text-success">🏢 {stats.users.providers.toLocaleString()}</span>
            </div>
            <div className="stat-card-info text-success">
              ↑ {stats.users.growthRate}% vs mois dernier
            </div>
          </div>

          <div className="stat-card">
            <BookingIcon className="w-8 h-8 mx-auto mb-2 text-accent" />
            <div className="stat-card-value text-accent">{stats.reservations.total.toLocaleString()}</div>
            <div className="stat-card-label">Réservations totales</div>
            <div className="flex justify-center gap-2 mt-2 text-xs">
              <span className="text-success">✅ {stats.reservations.completed.toLocaleString()}</span>
              <span className="text-error">❌ {stats.reservations.cancelled.toLocaleString()}</span>
              <span className="text-warning">⏳ {stats.reservations.pending.toLocaleString()}</span>
            </div>
          </div>

          <div className="stat-card">
            <ServicesIcon className="w-8 h-8 mx-auto mb-2 text-success" />
            <div className="stat-card-value text-success">{stats.services.total.toLocaleString()}</div>
            <div className="stat-card-label">Services proposés</div>
            {stats.services.pending > 0 && (
              <div className="stat-card-info text-warning">
                ⏳ {stats.services.pending} en validation
              </div>
            )}
          </div>

          <div className="stat-card">
            <ReviewIcon className="w-8 h-8 mx-auto mb-2 text-warning" />
            <div className="stat-card-value text-warning">{stats.engagement.satisfactionScore}/5</div>
            <div className="stat-card-label">Satisfaction client</div>
            <div className="stat-card-info">
              ⭐ Basé sur {stats.reservations.completed.toLocaleString()} avis
            </div>
          </div>
        </div>

        {/* Évolution des utilisateurs */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="card">
            <h3 className="font-semibold text-lg mb-4">
              📈 Évolution des utilisateurs
            </h3>
            <div className="space-y-3">
              {stats.charts.usersByMonth.map((item, idx) => {
                const maxValue = Math.max(...stats.charts.usersByMonth.flatMap(m => [m.clients, m.providers]));
                return (
                  <div key={idx}>
                    <div className="flex justify-between text-sm mb-1">
                      <span>{item.month}</span>
                      <div className="flex gap-4">
                        <span className="text-accent">👤 {item.clients.toLocaleString()}</span>
                        <span className="text-success">🏢 {item.providers.toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="flex gap-1 h-8">
                      <div 
                        className="bg-accent rounded transition-all"
                        style={{ width: `${Math.max(5, (item.clients / maxValue) * 100)}%` }}
                      />
                      <div 
                        className="bg-success rounded transition-all"
                        style={{ width: `${Math.max(5, (item.providers / maxValue) * 100)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Catégories populaires */}
          <div className="card">
            <h3 className="font-semibold text-lg mb-4">
              🏷️ Catégories les plus demandées
            </h3>
            <div className="space-y-4">
              {stats.charts.topCategories.map((category, idx) => {
                const maxBookings = stats.charts.topCategories[0]?.bookings || 1;
                return (
                  <div key={idx}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium">{category.category}</span>
                      <span>📅 {category.bookings.toLocaleString()} réservations</span>
                    </div>
                    <div className="progress-bar">
                      <div 
                        className="progress-bar-fill"
                        style={{ width: `${(category.bookings / maxBookings) * 100}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Répartition des statuts & Catégories par usage */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="card">
            <h3 className="font-semibold text-lg mb-4">
              📊 Statut des réservations
            </h3>
            <div className="space-y-3">
              {stats.charts.reservationsByStatus.map((status, idx) => {
                const total = stats.reservations.total;
                return (
                  <div key={idx}>
                    <div className="flex justify-between text-sm mb-1">
                      <span>{status.status}</span>
                      <span>{status.count.toLocaleString()} ({total > 0 ? Math.round((status.count / total) * 100) : 0}%)</span>
                    </div>
                    <div className="progress-bar">
                      <div 
                        className="progress-bar-fill"
                        style={{ 
                          width: `${total > 0 ? (status.count / total) * 100 : 0}%`,
                          backgroundColor: status.color
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Catégories par usage */}
          <div className="card">
            <h3 className="font-semibold text-lg mb-4">
              🎯 Répartition par catégorie de services
            </h3>
            <div className="space-y-3">
              {stats.charts.categoriesByUsage.map((cat, idx) => (
                <div key={idx}>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{cat.category}</span>
                    <span>{cat.percentage}%</span>
                  </div>
                  <div className="progress-bar">
                    <div 
                      className="progress-bar-fill"
                      style={{ width: `${cat.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Prestataires & Services */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="card">
            <h3 className="font-semibold text-lg mb-4">
              🏆 Top 3 Prestataires
            </h3>
            <div className="space-y-3">
              {stats.trending.topProviders.map((provider, idx) => (
                <div key={provider.id} className="ranking-item">
                  <div className={`ranking-number ${idx === 0 ? 'gold' : idx === 1 ? 'silver' : 'bronze'}`}>
                    {idx + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{provider.name}</p>
                    <div className="flex gap-3 text-xs text-muted">
                      <span>⭐ {provider.rating}/5</span>
                      <span>📅 {provider.bookings.toLocaleString()} réservations</span>
                    </div>
                  </div>
                </div>
              ))}
              {stats.trending.topProviders.length === 0 && (
                <p className="text-center text-sm text-muted">
                  Aucun prestataire pour le moment
                </p>
              )}
            </div>
          </div>

          <div className="card">
            <h3 className="font-semibold text-lg mb-4">
              🔥 Services les plus réservés
            </h3>
            <div className="space-y-3">
              {stats.trending.topServices.map((service, idx) => (
                <div key={service.id} className="ranking-item">
                  <div className="ranking-number default">
                    {idx + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{service.name}</p>
                    <p className="text-xs text-muted">{service.category}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">📅 {service.bookings.toLocaleString()}</p>
                    <p className="text-xs text-muted">réservations</p>
                  </div>
                </div>
              ))}
              {stats.trending.topServices.length === 0 && (
                <p className="text-center text-sm text-muted">
                  Aucun service pour le moment
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Statistiques par gouvernorat */}
        <div className="card mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
            <h3 className="font-semibold text-lg">
              🗺️ Activité par gouvernorat
            </h3>
            <select 
              className="input mt-2 md:mt-0 w-full md:w-auto"
              value={selectedGovernorate}
              onChange={(e) => setSelectedGovernorate(e.target.value)}
            >
              <option value="all">Tous les gouvernorats</option>
              {TUNISIAN_GOVERNORATES.map(gov => (
                <option key={gov} value={gov}>{gov}</option>
              ))}
            </select>
          </div>
          
          <div className="overflow-x-auto">
            <table className="table-app">
              <thead>
                <tr>
                  <th>Gouvernorat</th>
                  <th className="text-center">Clients</th>
                  <th className="text-center">Prestataires</th>
                  <th className="text-center">Services</th>
                  <th className="text-center">Réservations</th>
                  <th className="text-center">%</th>
                </tr>
              </thead>
              <tbody>
                {(selectedGovernorate === 'all' 
                  ? stats.geolocation.byGovernorate 
                  : stats.geolocation.byGovernorate.filter(g => g.governorate === selectedGovernorate)
                ).map((gov) => (
                  <tr key={gov.governorate}>
                    <td className="font-medium">{gov.governorate}</td>
                    <td className="text-center">{gov.clients.toLocaleString()}</td>
                    <td className="text-center">{gov.providers.toLocaleString()}</td>
                    <td className="text-center">{gov.services.toLocaleString()}</td>
                    <td className="text-center">{gov.bookings.toLocaleString()}</td>
                    <td className="text-center">
                      <div className="inline-flex items-center gap-2">
                        <span>{gov.percentage}%</span>
                        <div className="progress-bar w-16">
                          <div 
                            className="progress-bar-fill"
                            style={{ width: `${gov.percentage}%` }}
                          />
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Indicateurs d'engagement */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="stat-card">
            <span className="text-2xl mb-2">📊</span>
            <div className="stat-card-value text-primary">{stats.engagement.clientRetentionRate}%</div>
            <div className="stat-card-label">Fidélisation clients</div>
          </div>
          <div className="stat-card">
            <span className="text-2xl mb-2">⚡</span>
            <div className="stat-card-value text-success">{stats.engagement.providerActivityRate}%</div>
            <div className="stat-card-label">Prestataires actifs</div>
          </div>
          <div className="stat-card">
            <span className="text-2xl mb-2">⏱️</span>
            <div className="stat-card-value text-accent">{stats.engagement.avgResponseTime}h</div>
            <div className="stat-card-label">Temps de réponse moyen</div>
          </div>
          <div className="stat-card">
            <span className="text-2xl mb-2">⭐</span>
            <div className="stat-card-value text-warning">{stats.engagement.satisfactionScore}/5</div>
            <div className="stat-card-label">Note moyenne globale</div>
          </div>
        </div>

        {/* Actions rapides */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href="/admin/users" className="btn btn-primary text-center">
            👥 Gérer les utilisateurs
          </Link>
          <Link href="/admin/pending-services" className="btn btn-accent text-center">
            ✓ Valider les services
          </Link>
          <Link href="/admin/reported-reviews" className="btn btn-warning text-center">
            ⭐ Modérer les avis
          </Link>
        </div>
      </div>
    </div>
  );
}