'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';
import FavoriteButton from '@/components/FavoriteButton';
import FilterBar from './FilterBar';
import ServiceMap from './ServiceMap';

interface Service {
  _id: string;
  name: string;
  category: string;
  basePrice: number;
  avgRating: number;
  reviewCount: number;
  location: {
    type: string;
    coordinates: [number, number]; // [lng, lat]
    address: string;
    city: string;
    governorate: string;
  };
  images: string[];
  duration: number;
}

// ─── Inner page (needs useSearchParams) ──────────────────────────────────────

function CarteContent() {
  const { user } = useAuth();
  const searchParams   = useSearchParams();
  const categoryParam  = searchParams.get('category');

  const [services,         setServices]         = useState<Service[]>([]);
  const [filteredServices, setFilteredServices] = useState<Service[]>([]);
  const [userLocation,     setUserLocation]     = useState<[number, number] | null>(null);
  const [selectedService,  setSelectedService]  = useState<Service | null>(null);
  const [filters,          setFilters]          = useState({ category: categoryParam ?? '', radius: 10 });
  const [loading,          setLoading]          = useState(true);
  const [sidebarOpen,      setSidebarOpen]      = useState(true);
  const [mobileOpen,       setMobileOpen]       = useState(false);
const serviceIdParam = searchParams.get('serviceId');

  // ── Geolocation ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!('geolocation' in navigator)) {
      setUserLocation([10.1815, 36.8065]); // Tunis fallback
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => setUserLocation([pos.coords.longitude, pos.coords.latitude]),
      ()    => setUserLocation([10.1815, 36.8065]),
    );
  }, []);

  // ── Fetch nearby services ───────────────────────────────────────────────
  useEffect(() => {
    if (!userLocation) return;
    (async () => {
      setLoading(true);
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api';
        const res    = await fetch(
          `${apiUrl}/services/nearby` +
          `?lng=${userLocation[0]}&lat=${userLocation[1]}&distance=${filters.radius}`,
        );
        const data = await res.json();
        const arr  = Array.isArray(data) ? data : [];
        setServices(arr);
        setFilteredServices(arr);
      } catch {
        setServices([]);
        setFilteredServices([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [userLocation, filters.radius]);

  // ── Category filter (client-side) ──────────────────────────────────────
  useEffect(() => {
    setFilteredServices(
      filters.category
        ? services.filter((s) => s.category === filters.category)
        : [...services],
    );
  }, [filters.category, services]);

  // ── Handlers ────────────────────────────────────────────────────────────
  const handleMarkerClick = (service: Service) => {
    setSelectedService(service);
    setMobileOpen(false); // close sidebar on mobile after selecting
  };

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="cc-page">

      {/* Overlay mobile */}
      {mobileOpen && (
        <div className="cc-overlay" onClick={() => setMobileOpen(false)} />
      )}

      {/* ═══════ Sidebar ═════════════════════════════════════════════════ */}
      <aside
        className={[
          'cc-sidebar',
          sidebarOpen   ? 'cc-sidebar--open'        : 'cc-sidebar--collapsed',
          mobileOpen    ? 'cc-sidebar--mobile-open' : '',
        ].join(' ')}
      >
        {/* Header */}
        <div className="cc-sidebar__header">
          <div className="cc-sidebar__header-top">
            <span className="cc-sidebar__title">Services à proximité</span>

            {/* Desktop collapse toggle */}
            <button
              className="cc-sidebar__toggle"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label={sidebarOpen ? 'Réduire le panneau' : 'Agrandir le panneau'}
            >
              {sidebarOpen ? '←' : '→'}
            </button>

            {/* Mobile close */}
            <button
              className="cc-sidebar__close-mobile"
              onClick={() => setMobileOpen(false)}
              aria-label="Fermer"
            >
              ✕
            </button>
          </div>
          <span className="cc-sidebar__count">
            {loading ? 'Chargement…' : `${filteredServices.length} résultat(s)`}
          </span>
        </div>

        {/* Service list */}
        <div className="cc-sidebar__list">
          {loading ? (
            <div className="cc-sidebar__state">
              <div className="cc-dots">
                <div className="cc-dot" />
                <div className="cc-dot" />
                <div className="cc-dot" />
              </div>
              <p>Recherche des services…</p>
            </div>
          ) : filteredServices.length === 0 ? (
            <div className="cc-sidebar__state">
              <div className="cc-sidebar__empty-icon">📍</div>
              <p>Aucun service dans ce rayon</p>
              <p className="text-xs text-muted mt-1">
                Essayez d&apos;augmenter le rayon de recherche
              </p>
            </div>
          ) : (
            filteredServices.map((service, i) => (
              <div
                key={service._id}
                className={[
                  'cc-service-item',
                  selectedService?._id === service._id ? 'cc-service-item--active' : '',
                ].join(' ')}
                style={{ animationDelay: `${i * 40}ms` }}
                onClick={() => handleMarkerClick(service)}
              >
                <div className="cc-service-item__icon">📍</div>
                <div className="cc-service-item__body">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="cc-service-item__name">{service.name}</h3>
                      <p className="cc-service-item__addr">{service.location.address}</p>
                    </div>
                    {user?.role === 'client' && (
                      <FavoriteButton
                        serviceId={service._id}
                        size="sm"
                        className="relative"
                        onClick={(event) => event.stopPropagation()}
                      />
                    )}
                  </div>
                  <div className="cc-service-item__meta">
                    <span className="cc-badge-price">{service.basePrice} TND</span>
                    <span className="cc-badge-rating">★ {service.avgRating}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </aside>

      {/* ═══════ Main area ═══════════════════════════════════════════════ */}
      <div className="cc-main">
        <FilterBar filters={filters} onFilterChange={setFilters} />
        <div className="cc-map">
          <ServiceMap
            services={filteredServices}
            userLocation={userLocation}
            selectedService={selectedService}
            onMarkerClick={handleMarkerClick}
            isProviderMode={false}
          />
        </div>
      </div>

      {/* ═══════ Mobile FAB ══════════════════════════════════════════════ */}
      <button
        className="cc-fab"
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label="Voir les services"
      >
        {mobileOpen ? '✕' : '☰'}
        {filteredServices.length > 0 && (
          <span className="cc-fab__badge">{filteredServices.length}</span>
        )}
      </button>
    </div>
  );
}

// ─── Export with Suspense boundary (required for useSearchParams) ─────────────

export default function ClientCartePage() {
  return (
    <Suspense
      fallback={
        <div className="client-carte-suspense">
          <div className="spinner" />
          Chargement de la carte…
        </div>
      }
    >
      <CarteContent />
    </Suspense>
  );
}