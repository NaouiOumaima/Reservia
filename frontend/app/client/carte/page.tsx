'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
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
    coordinates: [number, number];
    address: string;
    city: string;
    governorate: string;
  };
  images: string[];
  duration: number;
}

function CarteContent() {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get('category');

  const [services, setServices] = useState<Service[]>([]);
  const [filteredServices, setFilteredServices] = useState<Service[]>([]);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [filters, setFilters] = useState({
    category: categoryParam || '',
    radius: 10,
  });
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLocation([pos.coords.longitude, pos.coords.latitude]),
        () => setUserLocation([10.1815, 36.8065])
      );
    } else {
      setUserLocation([10.1815, 36.8065]);
    }
  }, []);

  useEffect(() => {
    if (!userLocation) return;
    const fetchServices = async () => {
      setLoading(true);
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
        const res = await fetch(
          `${apiUrl}/services/nearby?lng=${userLocation[0]}&lat=${userLocation[1]}&distance=${filters.radius}`
        );
        const data = await res.json();
        const arr = Array.isArray(data) ? data : [];
        setServices(arr);
        setFilteredServices(arr);
      } catch {
        setServices([]);
        setFilteredServices([]);
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, [userLocation, filters.radius]);

  useEffect(() => {
    let filtered = [...services];
    if (filters.category) filtered = filtered.filter((s) => s.category === filters.category);
    setFilteredServices(filtered);
  }, [filters, services]);

  const handleMarkerClick = (service: Service) => {
    setSelectedService(service);
    setMobileOpen(false);
  };

  return (
    <div className="cc-page">

      {/* ── Overlay mobile ── */}
      {mobileOpen && (
        <div
          className="cc-overlay"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ── Sidebar ── */}
      <aside className={`cc-sidebar ${sidebarOpen ? 'cc-sidebar--open' : 'cc-sidebar--collapsed'} ${mobileOpen ? 'cc-sidebar--mobile-open' : ''}`}>

        {/* Header */}
        <div className="cc-sidebar__header">
          <div className="cc-sidebar__header-top">
            <span className="cc-sidebar__title">Services à proximité</span>
            {/* Bouton collapse desktop */}
            <button
              className="cc-sidebar__toggle"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label={sidebarOpen ? 'Réduire' : 'Agrandir'}
            >
              {sidebarOpen ? '←' : '→'}
            </button>
            {/* Bouton fermer mobile */}
            <button
              className="cc-sidebar__close-mobile"
              onClick={() => setMobileOpen(false)}
              aria-label="Fermer"
            >
              ✕
            </button>
          </div>
          <span className="cc-sidebar__count">{filteredServices.length} résultat(s)</span>
        </div>

        {/* Liste */}
        <div className="cc-sidebar__list">
          {loading ? (
            <div className="cc-sidebar__state">
              <div className="cc-dots">
                <div className="cc-dot" />
                <div className="cc-dot" />
                <div className="cc-dot" />
              </div>
              <p>Chargement…</p>
            </div>
          ) : filteredServices.length === 0 ? (
            <div className="cc-sidebar__state">
              <div className="cc-sidebar__empty-icon">📍</div>
              <p>Aucun service dans ce rayon</p>
            </div>
          ) : (
            filteredServices.map((service, i) => (
              <div
                key={service._id}
                className={`cc-service-item ${selectedService?._id === service._id ? 'cc-service-item--active' : ''}`}
                style={{ animationDelay: `${i * 40}ms` }}
                onClick={() => handleMarkerClick(service)}
              >
                <div className="cc-service-item__icon">📍</div>
                <div className="cc-service-item__body">
                  <h3 className="cc-service-item__name">{service.name}</h3>
                  <p className="cc-service-item__addr">{service.location.address}</p>
                  <div className="cc-service-item__meta">
                    <span className="cc-badge-free">Gratuit</span>
                    <span className="cc-badge-rating">★ {service.avgRating}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </aside>

      {/* ── Zone principale ── */}
      <div className="cc-main">
        <FilterBar filters={filters} onFilterChange={setFilters} />
        <div className="cc-map">
          <ServiceMap
            services={filteredServices}
            userLocation={userLocation}
            selectedService={selectedService}
            onMarkerClick={handleMarkerClick}
          />
        </div>
      </div>

     {/* ── Bouton mobile burger ── */}
<button
  className="cc-fab"
  onClick={() => setMobileOpen(!mobileOpen)}
  aria-label="Voir les services"
>
  {mobileOpen ? '✕' : '☰'}
  {/* Badge optionnel - toujours afficher le compteur si des services existent */}
  {filteredServices.length > 0 && (
    <span className="cc-fab__badge">{filteredServices.length}</span>
  )}
</button>
    </div>
  );
}

export default function ClientCartePage() {
  return (
    <Suspense fallback={
      <div className="client-carte-suspense">Chargement de la carte…</div>
    }>
      <CarteContent />
    </Suspense>
  );
}