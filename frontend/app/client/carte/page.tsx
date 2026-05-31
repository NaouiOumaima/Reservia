// app/client/carte/page.tsx
'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import FilterBar from './FilterBar';
import ServiceMap from './ServiceMap';
import { MenuIcon } from '@/components/ui/Icons';
import { servicesApi } from '@/lib/api/services/services.api';
import { Service } from '@/lib/api/services/types';

function CarteContent() {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get('category');

  const [services, setServices] = useState<Service[]>([]);
  const [filteredServices, setFilteredServices] = useState<Service[]>([]);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [filters, setFilters] = useState({
    category: categoryParam || '',
    radius: 10,
  });

  // Géolocalisation
  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLocation([pos.coords.longitude, pos.coords.latitude]),
        () => setUserLocation([10.1815, 36.8065]) // Centre Tunis par défaut
      );
    } else {
      setUserLocation([10.1815, 36.8065]);
    }
  }, []);

  // Récupération des services - l'API gère maintenant la catégorie
  const fetchServices = async () => {
    if (!userLocation) return;
    
    setLoading(true);
    try {
      // ✅ Appel API avec les deux filtres (rayon + catégorie)
      const nearbyServices = await servicesApi.getNearby(
        userLocation[0],  // lng
        userLocation[1],  // lat
        filters.radius,   // radius en km
        filters.category || undefined // catégorie (optionnelle)
      );
      
      setServices(nearbyServices);
      setFilteredServices(nearbyServices); // Plus besoin de filtrer côté frontend
    } catch (error) {
      console.error('Erreur chargement services:', error);
      setServices([]);
      setFilteredServices([]);
    } finally {
      setLoading(false);
    }
  };

  // Effet déclenché quand la localisation ou les filtres changent
  useEffect(() => {
    fetchServices();
  }, [userLocation, filters.radius, filters.category]); // ✅ category déclenche aussi le fetch

  const handleMarkerClick = (service: Service) => setSelectedService(service);
  const closeMobileSidebar = () => setMobileMenuOpen(false);

  return (
    <div className="carte-page">

      {/* Overlay mobile */}
      {mobileMenuOpen && (
        <div
          className="carte-overlay"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={[
          'carte-sidebar',
          sidebarOpen ? 'carte-sidebar--open' : '',
          mobileMenuOpen ? 'carte-sidebar--mobile-open' : '',
        ].join(' ')}
      >
        <div className="carte-sidebar__header">
          <div className="carte-sidebar__header-top">
            <h2 className="carte-sidebar__title">Services à proximité</h2>
            <button
              className="carte-sidebar__toggle"
              onClick={() => setSidebarOpen(false)}
              aria-label="Fermer la sidebar"
            >
              ◀
            </button>
          </div>
          <p className="carte-sidebar__count">{filteredServices.length} résultat(s)</p>
        </div>

        <div className="carte-sidebar__list">
          {loading ? (
            <div className="carte-sidebar__loading">
              <div className="carte-spinner" />
              <span>Chargement des services...</span>
            </div>
          ) : filteredServices.length === 0 ? (
            <div className="carte-sidebar__empty">
              <span className="carte-sidebar__empty-icon">🔍</span>
              <span>Aucun service trouvé</span>
              <span className="carte-sidebar__empty-hint">
                Essayez d'élargir votre rayon de recherche
              </span>
            </div>
          ) : (
            filteredServices.map((service) => (
              <div
                key={service._id}
                className={[
                  'carte-service-card',
                  selectedService?._id === service._id ? 'carte-service-card--active' : '',
                ].join(' ')}
                onClick={() => {
                  handleMarkerClick(service);
                  setMobileMenuOpen(false);
                }}
              >
                <h3 className="carte-service-card__name">{service.name}</h3>
                <p className="carte-service-card__address">{service.location.address}</p>
                <div className="carte-service-card__meta">
                  <span className="carte-service-card__price">Gratuit</span>
                  <div className="carte-service-card__rating">
                    <span>★</span>
                    <span>{service.avgRating}</span>
                    <span className="carte-service-card__rating-count">
                      ({service.reviewCount})
                    </span>
                  </div>
                </div>
                {service.duration && (
                  <div className="carte-service-card__duration">
                    ⏱️ {service.duration} min
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </aside>

      {/* Main content */}
      <div className="carte-main">
        {!sidebarOpen && (
          <button
            className="carte-toggle-btn"
            onClick={() => setSidebarOpen(true)}
            aria-label="Ouvrir la sidebar"
          >
            ▶
          </button>
        )}

        <FilterBar
          filters={filters}
          onFilterChange={setFilters}
        />

        <div className="carte-map-container">
          <ServiceMap
            services={filteredServices}
            userLocation={userLocation}
            selectedService={selectedService}
            onMarkerClick={handleMarkerClick}
          />
        </div>
      </div>

      {/* Bouton mobile */}
      <button
        className="carte-mobile-btn"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        aria-label="Ouvrir la liste des services"
      >
        <MenuIcon className="icon-md" />
      </button>
    </div>
  );
}

export default function ClientCartePage() {
  return (
    <Suspense fallback={<div className="carte-suspense">Chargement de la carte…</div>}>
      <CarteContent />
    </Suspense>
  );
}