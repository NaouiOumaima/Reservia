'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import FilterBar from './FilterBar';
import ServiceMap from './ServiceMap';
import { MenuIcon } from '@/components/ui/Icons';

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
    minPrice: 0,
    maxPrice: 500,
    radius: 10,
  });
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);      // pour desktop
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Géolocalisation
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

  // Récupération des services
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

  // Filtrage local
  useEffect(() => {
    let filtered = [...services];
    if (filters.category) filtered = filtered.filter((s) => s.category === filters.category);
    filtered = filtered.filter((s) => s.basePrice >= filters.minPrice && s.basePrice <= filters.maxPrice);
    setFilteredServices(filtered);
  }, [filters, services]);

  const handleMarkerClick = (service: Service) => setSelectedService(service);
  const closeMobileSidebar = () => setMobileMenuOpen(false);

  return (
    <div className="client-carte-page">
      {/* Sidebar */}
      <aside className={`client-carte-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="client-carte-sidebar-header">
          <div className="client-carte-sidebar-header-top">
            <h2>Services à proximité</h2>
            <button
              className="client-carte-sidebar-toggle"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label="Réduire la sidebar"
            >
              {sidebarOpen ? '◀' : '▶'}
            </button>
          </div>
          <p>{filteredServices.length} résultat(s)</p>
        </div>

        <div className="client-carte-services-list">
          {loading ? (
            <div className="client-carte-loading">
              <div className="spinner" />
              <span>Chargement…</span>
            </div>
          ) : filteredServices.length === 0 ? (
            <div className="client-carte-empty">
              <span>🔍</span>
              <span>Aucun service trouvé</span>
            </div>
          ) : (
            filteredServices.map((service) => (
              <div
                key={service._id}
                className={`client-carte-service-item ${selectedService?._id === service._id ? 'active' : ''}`}
                onClick={() => {
                  handleMarkerClick(service);
                  closeMobileSidebar();
                }}
              >
                <h3>{service.name}</h3>
                <p>{service.location.address}</p>
                <div className="client-carte-service-info">
                  <span className="price">{service.basePrice} DT</span>
                  <div className="rating">
                    <span>★</span>
                    <span>{service.avgRating}</span>
                    <span>({service.reviewCount})</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </aside>

      {/* Overlay mobile */}
      {mobileMenuOpen && <div className="client-carte-overlay" onClick={closeMobileSidebar} />}

      {/* Contenu principal */}
      <div className="client-carte-main">
        <FilterBar filters={filters} onFilterChange={setFilters} />
        <div className="client-carte-map-container">
          <ServiceMap
            services={filteredServices}
            userLocation={userLocation}
            selectedService={selectedService}
            onMarkerClick={handleMarkerClick}
          />
        </div>
      </div>

      {/* Bouton burger mobile */}
      <button
        className="client-carte-mobile-menu-btn"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        aria-label="Ouvrir la liste des services"
      >
        <MenuIcon className="w-5 h-5" />
      </button>
    </div>
  );
}

export default function ClientCartePage() {
  return (
    <Suspense fallback={<div className="client-carte-suspense">Chargement de la carte…</div>}>
      <CarteContent />
    </Suspense>
  );
}