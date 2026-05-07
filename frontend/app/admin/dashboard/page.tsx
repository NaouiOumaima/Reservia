'use client';

import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { adminApi, AdminStats } from '@/lib/api/admin/admin.api';

// Chart.js imports
import {
  Chart,
  LineElement,
  BarElement,
  ArcElement,
  PointElement,
  RadarController,
  LineController,
  BarController,
  DoughnutController,
  CategoryScale,
  LinearScale,
  RadialLinearScale,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

Chart.register(
  LineElement, BarElement, ArcElement, PointElement,
  RadarController, LineController, BarController, DoughnutController,
  CategoryScale, LinearScale, RadialLinearScale,
  Tooltip, Legend, Filler,
);

const fmt = (n: number) => n?.toLocaleString('fr-TN') ?? '0';

function useChart(
  ref: React.RefObject<HTMLCanvasElement | null>,
  build: () => Chart | null,
  deps: unknown[],
) {
  const instance = useRef<Chart | null>(null);
  useEffect(() => {
    instance.current?.destroy();
    instance.current = null;
    if (ref.current) instance.current = build();
    return () => { instance.current?.destroy(); };
  }, deps);
}

const COLORS = {
  blue: '#378ADD',
  green: '#1D9E75',
  purple: '#7F77DD',
  amber: '#EF9F27',
  pink: '#D4537E',
  red: '#E24B4A',
  gray: '#888780',
};

const CHART_DEFAULTS = {
  font: { family: "'Outfit', 'Inter', sans-serif", size: 11 },
  color: 'rgba(100,100,100,0.7)',
  grid: 'rgba(120,120,120,0.1)',
};

// Chart Components
function UsersLineChart({ data }: { data: AdminStats['charts']['usersByMonth'] }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useChart(ref, () => {
    if (!ref.current || !data?.length) return null;
    return new Chart(ref.current, {
      type: 'line',
      data: {
        labels: data.map(d => d.month),
        datasets: [
          {
            label: 'Clients', data: data.map(d => d.clients),
            borderColor: COLORS.blue, backgroundColor: 'rgba(55,138,221,0.08)',
            tension: 0.4, fill: true, borderWidth: 2, pointRadius: 3, pointBackgroundColor: COLORS.blue,
          },
          {
            label: 'Prestataires', data: data.map(d => d.providers),
            borderColor: COLORS.green, backgroundColor: 'transparent',
            tension: 0.4, borderWidth: 2, borderDash: [4, 3], pointRadius: 3, pointBackgroundColor: COLORS.green,
          },
          {
            label: 'Total', data: data.map(d => d.total),
            borderColor: COLORS.purple, backgroundColor: 'transparent',
            tension: 0.4, borderWidth: 1.5, borderDash: [2, 4], pointRadius: 0,
          },
        ],
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { color: CHART_DEFAULTS.grid }, ticks: { color: CHART_DEFAULTS.color, font: CHART_DEFAULTS.font } },
          y: { grid: { color: CHART_DEFAULTS.grid }, ticks: { color: CHART_DEFAULTS.color, font: CHART_DEFAULTS.font }, beginAtZero: false },
        },
      },
    });
  }, [data]);
  return <canvas ref={ref} className="w-full h-full" />;
}

function ReservationsBarChart({ data }: { data: AdminStats['charts']['reservationsByMonth'] }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useChart(ref, () => {
    if (!ref.current || !data?.length) return null;
    const max = Math.max(...data.map(d => d.count));
    return new Chart(ref.current, {
      type: 'bar',
      data: {
        labels: data.map(d => d.month),
        datasets: [{
          label: 'Réservations',
          data: data.map(d => d.count),
          backgroundColor: data.map(d => d.count === max ? '#042C53' : 'rgba(55,138,221,0.22)'),
          borderRadius: 5,
          borderSkipped: false,
        }],
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { display: false }, ticks: { color: CHART_DEFAULTS.color, font: CHART_DEFAULTS.font } },
          y: { grid: { color: CHART_DEFAULTS.grid }, ticks: { color: CHART_DEFAULTS.color, font: CHART_DEFAULTS.font } },
        },
      },
    });
  }, [data]);
  return <canvas ref={ref} className="w-full h-full" />;
}

function StatusDoughnut({ data }: { data: AdminStats['reservations'] }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useChart(ref, () => {
    if (!ref.current) return null;
    return new Chart(ref.current, {
      type: 'doughnut',
      data: {
        labels: ['Complétées', 'En attente', 'Annulées'],
        datasets: [{
          data: [data.completed, data.pending, data.cancelled],
          backgroundColor: [COLORS.green, COLORS.amber, COLORS.red],
          borderWidth: 0,
          hoverOffset: 4,
        }],
      },
      options: {
        responsive: true, maintainAspectRatio: false, cutout: '72%',
        plugins: { legend: { display: false } },
      },
    });
  }, [data]);
  return <canvas ref={ref} className="w-full h-full" />;
}

function WeekdayRadar({ data }: { data: AdminStats['charts']['reservationsByDayOfWeek'] }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useChart(ref, () => {
    if (!ref.current || !data?.length) return null;
    return new Chart(ref.current, {
      type: 'radar',
      data: {
        labels: data.map(d => d.day.substring(0, 3)),
        datasets: [{
          data: data.map(d => d.count),
          backgroundColor: 'rgba(127,119,221,0.15)',
          borderColor: COLORS.purple,
          borderWidth: 2,
          pointRadius: 3,
          pointBackgroundColor: COLORS.purple,
        }],
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          r: {
            grid: { color: CHART_DEFAULTS.grid },
            angleLines: { color: CHART_DEFAULTS.grid },
            ticks: { display: false },
            pointLabels: { color: CHART_DEFAULTS.color, font: CHART_DEFAULTS.font },
          },
        },
      },
    });
  }, [data]);
  return <canvas ref={ref} className="w-full h-full" />;
}

function HourlyLineChart({ data }: { data: AdminStats['charts']['reservationsByHour'] }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useChart(ref, () => {
    if (!ref.current || !data?.length) return null;
    const filtered = data.filter(d => d.count > 0 || (d.hour >= 6 && d.hour <= 22));
    return new Chart(ref.current, {
      type: 'line',
      data: {
        labels: filtered.map(d => `${d.hour}h`),
        datasets: [{
          data: filtered.map(d => d.count),
          borderColor: COLORS.pink,
          backgroundColor: 'rgba(212,83,126,0.08)',
          tension: 0.4, fill: true, borderWidth: 2, pointRadius: 2, pointBackgroundColor: COLORS.pink,
        }],
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { display: false }, ticks: { color: CHART_DEFAULTS.color, font: CHART_DEFAULTS.font, maxRotation: 0 } },
          y: { grid: { color: CHART_DEFAULTS.grid }, ticks: { color: CHART_DEFAULTS.color, font: CHART_DEFAULTS.font } },
        },
      },
    });
  }, [data]);
  return <canvas ref={ref} className="w-full h-full" />;
}

function EngagementRadar({ data }: { data: AdminStats['engagement'] }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useChart(ref, () => {
    if (!ref.current) return null;
    return new Chart(ref.current, {
      type: 'radar',
      data: {
        labels: ['Fidélisation', 'Activité', 'Conversion', 'Satisfaction', 'Récurrence'],
        datasets: [{
          data: [
            data.clientRetention,
            data.providerActivity,
            data.conversionRate,
            data.satisfactionScore * 20,
            data.repeatCustomers,
          ],
          backgroundColor: 'rgba(29,158,117,0.15)',
          borderColor: COLORS.green,
          borderWidth: 2,
          pointRadius: 3,
          pointBackgroundColor: COLORS.green,
        }],
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          r: {
            min: 0, max: 100,
            grid: { color: CHART_DEFAULTS.grid },
            angleLines: { color: CHART_DEFAULTS.grid },
            ticks: { display: false },
            pointLabels: { color: CHART_DEFAULTS.color, font: { size: 10 } },
          },
        },
      },
    });
  }, [data]);
  return <canvas ref={ref} className="w-full h-full" />;
}

function CategoriesPie({ data }: { data: AdminStats['charts']['categoriesDistribution'] }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useChart(ref, () => {
    if (!ref.current || !data?.length) return null;
    return new Chart(ref.current, {
      type: 'doughnut',
      data: {
        labels: data.map(d => d.category),
        datasets: [{
          data: data.map(d => d.count),
          backgroundColor: data.map(d => d.color),
          borderWidth: 0,
          hoverOffset: 4,
        }],
      },
      options: {
        responsive: true, maintainAspectRatio: false, cutout: '60%',
        plugins: { legend: { display: false } },
      },
    });
  }, [data]);
  return <canvas ref={ref} className="w-full h-full" />;
}

function ChartLegend({ items }: { items: { color: string; label: string }[] }) {
  return (
    <div className="admin-chart-legend">
      {items.map(i => (
        <span key={i.label} className="admin-chart-legend-item">
          <span className="admin-chart-legend-dot" style={{ background: i.color }} />
          {i.label}
        </span>
      ))}
    </div>
  );
}

function GovernorateList({ data }: { data: AdminStats['charts']['governorateStats'] }) {
  const top = data?.slice(0, 12) ?? [];
  const maxBookings = top[0]?.bookings ?? 1;
  return (
    <div className="admin-governorate-list">
      {top.length === 0 && <div className="admin-empty-state">Aucune donnée</div>}
      {top.map(g => (
        <div key={g.governorate} className="admin-governorate-item">
          <span className="admin-governorate-name">{g.governorate}</span>
          <div className="admin-governorate-bar">
            <div
              className="admin-governorate-fill"
              style={{ width: `${Math.round((g.bookings / maxBookings) * 100)}%` }}
            />
          </div>
          <span className="admin-governorate-percent">{g.percentage}%</span>
        </div>
      ))}
    </div>
  );
}

// Main Component
export default function AdminDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month');

  useEffect(() => {
    if (!user) { router.push('/login'); return; }
    if (user.role !== 'admin') { router.push('/'); return; }
  }, [user, router]);

  useEffect(() => {
    if (user?.role !== 'admin') return;
    setLoading(true);
    adminApi.getStats(timeRange)
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user, timeRange]);

  if (!user || user.role !== 'admin') return null;

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="admin-loading-content">
          <div className="spinner" />
          <p className="text-muted">Chargement des statistiques...</p>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  const u = stats.users;
  const r = stats.reservations;
  const s = stats.services;
  const rv = stats.reviews;
  const e = stats.engagement;
  const c = stats.charts;
  const t = stats.trending;

  const successRate = r.total > 0 ? Math.round((r.completed / r.total) * 100) : 0;

  return (
    <div className="admin-dashboard-page">
      <div className="admin-dashboard-container">
        {/* Header */}
        <div className="admin-dashboard-header">
          <div>
            <h1 className="admin-dashboard-title">Tableau de bord</h1>
            <p className="admin-dashboard-subtitle">
              {user.firstName} {user.lastName} · administration
            </p>
          </div>
          <div className="admin-dashboard-timerange">
            {(['week', 'month', 'year'] as const).map(range => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`admin-timerange-btn ${timeRange === range ? 'active' : ''}`}
              >
                {range === 'week' ? 'Semaine' : range === 'month' ? 'Mois' : 'Année'}
              </button>
            ))}
          </div>
        </div>

        {/* KPI Row */}
        <div className="admin-kpi-grid">
          <div className="admin-kpi-card">
            <p className="admin-kpi-label">Utilisateurs</p>
            <p className="admin-kpi-value">{fmt(u.total)}</p>
            <span className="admin-kpi-badge admin-kpi-badge-up">+{u.growthRate}%</span>
            <div className="admin-kpi-accent" style={{ background: COLORS.blue }} />
          </div>
          <div className="admin-kpi-card">
            <p className="admin-kpi-label">Réservations</p>
            <p className="admin-kpi-value">{fmt(r.total)}</p>
            <span className="admin-kpi-badge admin-kpi-badge-info">{successRate}% succès</span>
            <div className="admin-kpi-accent" style={{ background: COLORS.green }} />
          </div>
          <div className="admin-kpi-card">
            <p className="admin-kpi-label">Services actifs</p>
            <p className="admin-kpi-value">{fmt(s.active)}</p>
            {s.pending > 0 && <span className="admin-kpi-badge admin-kpi-badge-warn">{s.pending} en attente</span>}
            <div className="admin-kpi-accent" style={{ background: COLORS.amber }} />
          </div>
          <div className="admin-kpi-card">
            <p className="admin-kpi-label">Note moyenne</p>
            <p className="admin-kpi-value">{rv.averageRating}/5</p>
            <span className="admin-kpi-badge admin-kpi-badge-info">{fmt(rv.total)} avis</span>
            <div className="admin-kpi-accent" style={{ background: COLORS.purple }} />
          </div>
          <div className="admin-kpi-card">
            <p className="admin-kpi-label">Conversion</p>
            <p className="admin-kpi-value">{e.conversionRate}%</p>
            <span className="admin-kpi-badge admin-kpi-badge-up">{e.providerActivity}% actifs</span>
            <div className="admin-kpi-accent" style={{ background: COLORS.pink }} />
          </div>
        </div>

        {/* Row 1: Users line + Status doughnut */}
        <div className="admin-grid-2cols">
          <div className="admin-section-card">
            <div className="admin-section-header">
              <h3 className="admin-section-title">Évolution des utilisateurs</h3>
              <span className="admin-section-badge">6 derniers mois</span>
            </div>
            <ChartLegend items={[
              { color: COLORS.blue, label: 'Clients' },
              { color: COLORS.green, label: 'Prestataires' },
              { color: COLORS.purple, label: 'Total' },
            ]} />
            <div className="admin-chart-container">
              <UsersLineChart data={c.usersByMonth} />
            </div>
          </div>

          <div className="admin-section-card">
            <div className="admin-section-header">
              <h3 className="admin-section-title">Statuts réservations</h3>
            </div>
            <div className="admin-chart-sm">
              <StatusDoughnut data={r} />
            </div>
            <div className="admin-status-grid">
              <div className="admin-status-item">
                <p className="admin-status-value" style={{ color: COLORS.green }}>{fmt(r.completed)}</p>
                <p className="admin-status-label">Complétées</p>
              </div>
              <div className="admin-status-item">
                <p className="admin-status-value" style={{ color: COLORS.amber }}>{fmt(r.pending)}</p>
                <p className="admin-status-label">En attente</p>
              </div>
              <div className="admin-status-item">
                <p className="admin-status-value" style={{ color: COLORS.red }}>{fmt(r.cancelled)}</p>
                <p className="admin-status-label">Annulées</p>
              </div>
            </div>
          </div>
        </div>

        {/* Row 2: Reservations bar + Weekday radar */}
        <div className="admin-grid-2cols">
          <div className="admin-section-card">
            <div className="admin-section-header">
              <h3 className="admin-section-title">Réservations par mois</h3>
              <span className="admin-section-badge">Histogramme</span>
            </div>
            <div className="admin-chart-md">
              <ReservationsBarChart data={c.reservationsByMonth} />
            </div>
          </div>

          <div className="admin-section-card">
            <div className="admin-section-header">
              <h3 className="admin-section-title">Pic d'activité hebdomadaire</h3>
              <span className="admin-section-badge">Radar</span>
            </div>
            <div className="admin-chart-md">
              <WeekdayRadar data={c.reservationsByDayOfWeek} />
            </div>
          </div>
        </div>

        {/* Row 3: Hourly + Engagement radar */}
        <div className="admin-grid-2cols">
          <div className="admin-section-card">
            <div className="admin-section-header">
              <h3 className="admin-section-title">Activité par heure</h3>
              <span className="admin-section-badge">Courbe 24h</span>
            </div>
            <div className="admin-chart-md">
              <HourlyLineChart data={c.reservationsByHour} />
            </div>
          </div>

          <div className="admin-section-card">
            <div className="admin-section-header">
              <h3 className="admin-section-title">Indicateurs d'engagement</h3>
              <span className="admin-section-badge">Radar</span>
            </div>
            <div className="admin-chart-md">
              <EngagementRadar data={e} />
            </div>
          </div>
        </div>

        {/* Row 4: Categories + Top providers + Top services */}
        <div className="admin-grid-3cols">
          {/* Categories */}
          <div className="admin-section-card">
            <div className="admin-section-header">
              <h3 className="admin-section-title">Répartition des catégories</h3>
            </div>
            <div className="admin-chart-sm">
              <CategoriesPie data={c.categoriesDistribution} />
            </div>
            <div className="space-y-1 mt-2">
              {c.categoriesDistribution?.slice(0, 5).map(cat => (
                <div key={cat.category} className="flex items-center justify-between text-[11px]">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-sm" style={{ background: cat.color }} />
                    <span className="text-foreground truncate max-w-[120px]">{cat.category}</span>
                  </span>
                  <span className="text-muted font-mono">{cat.percentage}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Top providers */}
          <div className="admin-section-card">
            <div className="admin-section-header">
              <h3 className="admin-section-title">Top prestataires</h3>
            </div>
            <div className="space-y-0.5">
              {t.topProviders?.length === 0 && <div className="admin-empty-state">Aucune donnée</div>}
              {t.topProviders?.map((p, i) => {
                const pct = t.topProviders[0]?.bookings > 0 
                  ? Math.round((p.bookings / t.topProviders[0].bookings) * 100) 
                  : 0;
                return (
                  <div key={p.id} className="admin-rank-bar">
                    <span className="admin-rank-number">{String(i + 1).padStart(2, '0')}</span>
                    <div className="admin-rank-content">
                      <div className="admin-rank-header">
                        <div>
                          <span className="admin-rank-name">{p.name}</span>
                          <span className="admin-rank-sub">⭐ {p.rating}</span>
                        </div>
                        <span className="admin-rank-value">{fmt(p.bookings)}</span>
                      </div>
                      <div className="admin-rank-progress">
                        <div className="admin-rank-progress-fill" style={{ width: `${pct}%`, background: [COLORS.amber, '#C0DD97', COLORS.gray][i] || COLORS.gray }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Top services */}
          <div className="admin-section-card">
            <div className="admin-section-header">
              <h3 className="admin-section-title">Services les plus réservés</h3>
            </div>
            <div className="space-y-0.5">
              {t.topServices?.length === 0 && <div className="admin-empty-state">Aucune donnée</div>}
              {t.topServices?.map((sv, i) => {
                const pct = t.topServices[0]?.bookings > 0 
                  ? Math.round((sv.bookings / t.topServices[0].bookings) * 100) 
                  : 0;
                return (
                  <div key={sv.id} className="admin-rank-bar">
                    <span className="admin-rank-number">{String(i + 1).padStart(2, '0')}</span>
                    <div className="admin-rank-content">
                      <div className="admin-rank-header">
                        <div>
                          <span className="admin-rank-name">{sv.name}</span>
                          <span className="admin-rank-sub">{sv.category}</span>
                        </div>
                        <span className="admin-rank-value">{fmt(sv.bookings)}</span>
                      </div>
                      <div className="admin-rank-progress">
                        <div className="admin-rank-progress-fill" style={{ width: `${pct}%`, background: COLORS.blue }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Row 5: Top categories + Governorates */}
        <div className="admin-grid-2cols">
          <div className="admin-section-card">
            <div className="admin-section-header">
              <h3 className="admin-section-title">Catégories les plus demandées</h3>
            </div>
            <div className="space-y-0.5">
              {c.topCategories?.map((cat, i) => {
                const pct = c.topCategories[0]?.bookings > 0 
                  ? Math.round((cat.bookings / c.topCategories[0].bookings) * 100) 
                  : 0;
                return (
                  <div key={cat.category} className="admin-rank-bar">
                    <span className="admin-rank-number">{String(i + 1).padStart(2, '0')}</span>
                    <div className="admin-rank-content">
                      <div className="admin-rank-header">
                        <span className="admin-rank-name">{cat.category}</span>
                        <span className="admin-rank-value">{fmt(cat.bookings)}</span>
                      </div>
                      <div className="admin-rank-progress">
                        <div className="admin-rank-progress-fill" style={{ width: `${pct}%`, background: COLORS.purple }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="admin-section-card">
            <div className="admin-section-header">
              <h3 className="admin-section-title">Activité par gouvernorat</h3>
              <span className="admin-section-badge">Top 12</span>
            </div>
            <GovernorateList data={c.governorateStats} />
          </div>
        </div>

        {/* Engagement mini cards */}
        <div className="admin-engagement-grid">
          <div className="admin-engagement-card">
            <p className="admin-engagement-value" style={{ color: COLORS.blue }}>{e.clientRetention}%</p>
            <p className="admin-engagement-label">Fidélisation clients</p>
          </div>
          <div className="admin-engagement-card">
            <p className="admin-engagement-value" style={{ color: COLORS.green }}>{e.providerActivity}%</p>
            <p className="admin-engagement-label">Prestataires actifs</p>
          </div>
          <div className="admin-engagement-card">
            <p className="admin-engagement-value" style={{ color: COLORS.amber }}>{e.repeatCustomers}%</p>
            <p className="admin-engagement-label">Clients récurrents</p>
          </div>
          <div className="admin-engagement-card">
            <p className="admin-engagement-value" style={{ color: COLORS.purple }}>{e.satisfactionScore}/5</p>
            <p className="admin-engagement-label">Satisfaction globale</p>
          </div>
        </div>

        {/* Quick actions */}
        <div className="admin-quick-actions">
          <Link href="/admin/users" className="admin-quick-action-btn admin-quick-action-outline">
            Gérer les utilisateurs
          </Link>
          <Link href="/admin/pending-services" className="admin-quick-action-btn admin-quick-action-primary">
            Valider les services {s.pending > 0 && `(${s.pending})`}
          </Link>
          <Link href="/admin/reported-reviews" className="admin-quick-action-btn admin-quick-action-outline">
            Modérer les avis
          </Link>
        </div>
      </div>
    </div>
  );
}