'use client';

import { useState, useEffect } from 'react';
import TunisiaMap from '@/components/charts/TunisiaMap';
import ServiceCard from '@/components/service/ServiceCard';
import { useServices } from '@/features/services/hooks/useServices';
import type { SearchFilters } from '@/types';
import {
  AllCategoriesIcon,
  RestaurantIcon,
  HotelIcon,
  SpaIcon,
  FitnessIcon,
  HealthIcon,
  LocationIcon,
  SearchIcon,
  StarIcon,
} from '@/components/ui/Icons';

// Coordonnées approximatives des gouvernorats
const GOVERNORATE_COORDINATES: Record<string, { lat: number; lng: number }> = {
  "Tunis": { lat: 36.8065, lng: 10.1815 },
  "Ariana": { lat: 36.8625, lng: 10.1956 },
  "Ben Arous": { lat: 36.753, lng: 10.218 },
  "Manouba": { lat: 36.807, lng: 10.096 },
  "Nabeul": { lat: 36.456, lng: 10.734 },
  "Zaghouan": { lat: 36.403, lng: 10.143 },
  "Bizerte": { lat: 37.274, lng: 9.874 },
  "Béja": { lat: 36.725, lng: 9.182 },
  "Jendouba": { lat: 36.501, lng: 8.779 },
  "Le Kef": { lat: 36.178, lng: 8.711 },
  "Siliana": { lat: 36.085, lng: 9.374 },
  "Kairouan": { lat: 35.678, lng: 10.096 },
  "Kasserine": { lat: 35.167, lng: 8.837 },
  "Sidi Bouzid": { lat: 35.038, lng: 9.485 },
  "Sousse": { lat: 35.825, lng: 10.636 },
  "Monastir": { lat: 35.765, lng: 10.826 },
  "Mahdia": { lat: 35.504, lng: 11.062 },
  "Sfax": { lat: 34.741, lng: 10.761 },
  "Gafsa": { lat: 34.425, lng: 8.784 },
  "Tozeur": { lat: 33.924, lng: 8.133 },
  "Kébili": { lat: 33.704, lng: 8.969 },
  "Gabès": { lat: 33.881, lng: 10.098 },
  "Médenine": { lat: 33.355, lng: 10.505 },
  "Tataouine": { lat: 32.93, lng: 10.451 },
};

// Catégories de services avec icônes SVG
const CATEGORIES = [
  { id: 'all', name: 'Toutes catégories', icon: AllCategoriesIcon },
  { id: 'restaurant', name: 'Restaurants', icon: RestaurantIcon },
  { id: 'hotel', name: 'Hôtels', icon: HotelIcon },
  { id: 'spa', name: 'Beauté & Bien-être', icon: SpaIcon },
  { id: 'fitness', name: 'Salles de sport', icon: FitnessIcon },
  { id: 'health', name: 'Santé', icon: HealthIcon },
];

export default function SearchPage() {
  const [selectedGovernorate, setSelectedGovernorate] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [filters, setFilters] = useState<SearchFilters>({
    category: '',
    minPrice: undefined,
    maxPrice: undefined,
    minRating: undefined,
    sortBy: 'smart',
  });
  
  const { services, loading, error, search } = useServices();

  useEffect(() => {
    if (selectedGovernorate) {
      const coords = GOVERNORATE_COORDINATES[selectedGovernorate];
      search('', {
        ...filters,
        category: selectedCategory !== 'all' ? selectedCategory : '',
        location: coords ? {
          lat: coords.lat,
          lng: coords.lng,
          radius: 50,
        } : undefined,
      });
    }
  }, [selectedGovernorate, selectedCategory, filters, search]);

  const handleGovernorateClick = (governorateName: string) => {
    setSelectedGovernorate(governorateName);
  };

  const handleBackToMap = () => {
    setSelectedGovernorate(null);
    setSelectedCategory('all');
  };

  const handleFilterChange = (newFilters: Partial<SearchFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    if (selectedGovernorate) {
      const coords = GOVERNORATE_COORDINATES[selectedGovernorate];
      search('', {
        ...filters,
        ...newFilters,
        category: selectedCategory !== 'all' ? selectedCategory : '',
        location: coords ? {
          lat: coords.lat,
          lng: coords.lng,
          radius: 50,
        } : undefined,
      });
    }
  };

  // Vue carte (sélection du gouvernorat)
  if (!selectedGovernorate) {
    return (
      <div className="search-page-container">
        <div className="search-page-content">
          
          {/* Catégories */}
          <div className="search-categories">
            <div className="search-categories-wrapper">
              {CATEGORIES.map((cat) => {
                const IconComponent = cat.icon;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`search-category-btn ${selectedCategory === cat.id ? 'search-category-btn-active' : 'search-category-btn-inactive'}`}
                  >
                    <IconComponent className="w-4 h-4" />
                    <span>{cat.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Étapes 1 → 2 → 3 avec icônes SVG */}
          <div className="search-steps">
            <div className="search-step">
              <div className="search-step-number">1</div>
              <div className="search-step-content">
                <div className="search-step-icon">
                  <LocationIcon className="w-6 h-6" />
                </div>
                <h3 className="search-step-title">Choisissez une région</h3>
                <p className="search-step-desc">Cliquez sur un gouvernorat sur la carte</p>
              </div>
              <div className="search-step-arrow">→</div>
            </div>

            <div className="search-step">
              <div className="search-step-number">2</div>
              <div className="search-step-content">
                <div className="search-step-icon">
                  <SearchIcon className="w-6 h-6" />
                </div>
                <h3 className="search-step-title">Filtrez par catégorie</h3>
                <p className="search-step-desc">Sélectionnez le type de service souhaité</p>
              </div>
              <div className="search-step-arrow">→</div>
            </div>

            <div className="search-step">
              <div className="search-step-number">3</div>
              <div className="search-step-content">
                <div className="search-step-icon">
                  <StarIcon className="w-6 h-6" />
                </div>
                <h3 className="search-step-title">Réservez</h3>
                <p className="search-step-desc">Parcourez et réservez en quelques clics</p>
              </div>
            </div>
          </div>

          {/* Carte Tunisie */}
          <TunisiaMap onGovernorateClick={handleGovernorateClick} />

        </div>
      </div>
    );
  }

  // Vue résultats
  return (
    <div className="search-results-container">
      <div className="search-results-header">
        <div className="search-results-header-content">
          <button onClick={handleBackToMap} className="search-back-btn">
            <svg className="search-back-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Retour à la carte
          </button>
          <h1 className="search-results-title">{selectedGovernorate}</h1>
          <p className="search-results-subtitle">
            {selectedCategory !== 'all' 
              ? CATEGORIES.find(c => c.id === selectedCategory)?.name 
              : 'Tous services'}
          </p>
        </div>
      </div>

      <div className="search-results-content">
        
        <div className="search-filters">
          <div className="search-filters-grid">
            <div className="search-filter-group">
              <label className="search-filter-label">Prix min</label>
              <input
                type="number"
                placeholder="Min"
                className="search-filter-input"
                onChange={(e) => handleFilterChange({ minPrice: e.target.value ? Number(e.target.value) : undefined })}
              />
            </div>
            <div className="search-filter-group">
              <label className="search-filter-label">Prix max</label>
              <input
                type="number"
                placeholder="Max"
                className="search-filter-input"
                onChange={(e) => handleFilterChange({ maxPrice: e.target.value ? Number(e.target.value) : undefined })}
              />
            </div>
            <div className="search-filter-group">
              <label className="search-filter-label">Trier par</label>
              <select
                className="search-filter-select"
                onChange={(e) => handleFilterChange({ sortBy: e.target.value as any })}
              >
                <option value="smart">Meilleur score</option>
                <option value="rating">Note la plus élevée</option>
                <option value="price_asc">Prix croissant</option>
                <option value="price_desc">Prix décroissant</option>
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="search-loading">
            <div className="search-spinner"></div>
            <p className="search-loading-text">Chargement des services...</p>
          </div>
        ) : error ? (
          <div className="search-error">
            <p className="search-error-text">{error}</p>
            <button onClick={handleBackToMap} className="search-error-btn">Retour à la carte</button>
          </div>
        ) : services.length === 0 ? (
          <div className="search-empty">
            <div className="search-empty-icon">🔍</div>
            <p className="search-empty-title">Aucun service trouvé dans cette région</p>
            <button onClick={handleBackToMap} className="search-empty-btn">Explorer d'autres régions</button>
          </div>
        ) : (
          <>
            <div className="search-results-count">
              <p className="search-results-count-text">{services.length} service(s) trouvé(s)</p>
            </div>
            <div className="search-results-grid">
              {services.map((service) => (
                <ServiceCard key={service._id} service={service} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}