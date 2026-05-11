'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import TunisiaMap from '@/components/charts/TunisiaMap';
import ServiceCard from '@/components/service/ServiceCard';
import { useServices } from '@/features/services/hooks/useServices';
import { TUNISIAN_GOVERNORATES, GOVERNORATE_COORDINATES } from '@/lib/api/constants/governorates';
import { CATEGORIES, getAllCategoryLabels } from '@/lib/api/constants/categories.';
import { SearchIcon, StarIcon, LocationIcon, AllCategoriesIcon } from '@/components/ui/Icons';

// Mapping pour les catégories avec icônes et noms d'affichage
const CATEGORIES_WITH_DISPLAY = [
  { 
    id: '', 
    name: 'Toutes catégories', 
    icon: AllCategoriesIcon 
  },
  ...CATEGORIES.map(cat => ({
    id: cat.label,
    name: cat.frenchLabel,
    icon: () => cat.icon,
  })),
];

export default function SearchPage() {
  const router = useRouter();
  const { services, loading, error, search } = useServices();
  
  const [selectedGovernorate, setSelectedGovernorate] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [filters, setFilters] = useState({
    minPrice: 0,
    maxPrice: 500,
    minRating: 0,
  });

  // Recherche quand un gouvernorat est sélectionné ou quand les filtres changent
  useEffect(() => {
    const performSearch = async () => {
      const searchFilters: any = {
        category: selectedCategory || undefined,
        minPrice: filters.minPrice > 0 ? filters.minPrice : undefined,
        maxPrice: filters.maxPrice < 500 ? filters.maxPrice : undefined,
        minRating: filters.minRating > 0 ? filters.minRating : undefined,
      };
      
      if (selectedGovernorate && GOVERNORATE_COORDINATES[selectedGovernorate as keyof typeof GOVERNORATE_COORDINATES]) {
        const coords = GOVERNORATE_COORDINATES[selectedGovernorate as keyof typeof GOVERNORATE_COORDINATES];
        searchFilters.location = {
          lat: coords.lat,
          lng: coords.lng,
          radius: 50,
        };
        await search('', searchFilters);
      }
    };
    
    performSearch();
  }, [selectedGovernorate, selectedCategory, filters, search]);

  const handleGovernorateClick = (governorateName: string) => {
    setSelectedGovernorate(governorateName);
  };

  const handleBackToMap = () => {
    setSelectedGovernorate(null);
    setSelectedCategory('');
    setFilters({ minPrice: 0, maxPrice: 500, minRating: 0 });
  };

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
  };

  const handleFilterChange = (key: keyof typeof filters, value: number) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setSelectedCategory('');
    setFilters({ minPrice: 0, maxPrice: 500, minRating: 0 });
  };

  // Vue carte (sélection du gouvernorat)
  if (!selectedGovernorate) {
    return (
      <div className="search-page-container">
        <div className="search-page-content">
          
          {/* Catégories */}
          <div className="search-categories">
            <div className="search-categories-wrapper">
              {CATEGORIES_WITH_DISPLAY.map((cat) => {
                const IconComponent = typeof cat.icon === 'function' ? cat.icon : cat.icon;
                return (
                  <button
                    key={cat.id}
                    onClick={() => handleCategoryChange(cat.id)}
                    className={`search-category-btn ${selectedCategory === cat.id ? 'search-category-btn-active' : 'search-category-btn-inactive'}`}
                  >
                    <IconComponent className="w-4 h-4" />
                    <span>{cat.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Étapes 1 → 2 → 3 */}
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
            {selectedCategory 
              ? CATEGORIES_WITH_DISPLAY.find(c => c.id === selectedCategory)?.name 
              : 'Tous services'}
          </p>
        </div>
      </div>

      <div className="search-results-content">
        
        {/* Filtres */}
        <div className="search-filters">
          <div className="search-filters-grid">
            <div className="search-filter-group">
              <label className="search-filter-label">Prix min</label>
              <input
                type="number"
                placeholder="Min"
                className="search-filter-input"
                value={filters.minPrice || ''}
                onChange={(e) => handleFilterChange('minPrice', e.target.value ? Number(e.target.value) : 0)}
              />
            </div>
            <div className="search-filter-group">
              <label className="search-filter-label">Prix max</label>
              <input
                type="number"
                placeholder="Max"
                className="search-filter-input"
                value={filters.maxPrice === 500 ? '' : filters.maxPrice}
                onChange={(e) => handleFilterChange('maxPrice', e.target.value ? Number(e.target.value) : 500)}
              />
            </div>
            <div className="search-filter-group">
              <label className="search-filter-label">Note min</label>
              <select
                className="search-filter-select"
                value={filters.minRating}
                onChange={(e) => handleFilterChange('minRating', Number(e.target.value))}
              >
                <option value={0}>Toutes les notes</option>
                <option value={4.5}>4.5+ étoiles</option>
                <option value={4}>4+ étoiles</option>
                <option value={3}>3+ étoiles</option>
              </select>
            </div>
            {(selectedCategory || filters.minPrice > 0 || filters.maxPrice < 500 || filters.minRating > 0) && (
              <div className="search-filter-group">
                <button onClick={resetFilters} className="btn btn-ghost text-sm mt-6">
                  Réinitialiser
                </button>
              </div>
            )}
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