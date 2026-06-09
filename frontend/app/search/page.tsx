// app/search/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import TunisiaMap from '@/components/charts/TunisiaMap';
import ServiceCard from '@/components/service/ServiceCard';
import ServiceDetailsModal from '@/components/service/ServiceDetailsModal';
import { useServices } from '@/features/services/hooks/useServices';
import { GOVERNORATE_COORDINATES } from '@/lib/api/constants/governorates';
import {
  SearchIcon,
  StarIcon,
  LocationIcon,
  ChevronLeftIcon,
} from '@/components/ui/Icons';
// ⚠️ IMPORTANT: Utiliser le type Service depuis le hook useServices ou depuis lib/api/services/types
import type { Service } from '@/lib/api/services/types';
import { CATEGORIES } from '@/lib/api/constants/categories.';

export default function SearchPage() {
  const router = useRouter();
  const { services, loading, error, search } = useServices();

  const [selectedGovernorate, setSelectedGovernorate] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [filters, setFilters] = useState({ minRating: 0 });
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const performSearch = async () => {
      const searchFilters: any = {
        category: selectedCategory || undefined,
        minRating: filters.minRating > 0 ? filters.minRating : undefined,
      };

      if (
        selectedGovernorate &&
        GOVERNORATE_COORDINATES[selectedGovernorate as keyof typeof GOVERNORATE_COORDINATES]
      ) {
        const coords =
          GOVERNORATE_COORDINATES[selectedGovernorate as keyof typeof GOVERNORATE_COORDINATES];
        searchFilters.location = { lat: coords.lat, lng: coords.lng, radius: 50 };
        await search('', searchFilters);
      } else if (selectedGovernorate === null) {
        return;
      }
    };

    performSearch();
  }, [selectedGovernorate, selectedCategory, filters, search]);

  const handleBackToMap = () => {
    setSelectedGovernorate(null);
    setSelectedCategory('');
    setFilters({ minRating: 0 });
  };

  const resetFilters = () => {
    setSelectedCategory('');
    setFilters({ minRating: 0 });
  };

  const handleServiceClick = (service: Service) => {
    console.log('🖱️ Clic sur service:', service.name);
    setSelectedService(service);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedService(null);
  };

  // Redirige vers la page complète du service
  const handleViewFullDetails = (service: Service) => {
    setShowModal(false);
    router.push(`/service/${service._id}`);
  };

  return (
    <>
      {/* ── Vue carte ── */}
      {!selectedGovernorate && (
        <div className="search-page-container">
          <div className="search-page-content">
            {/* Catégories */}
            <div className="search-categories">
              <div className="search-categories-wrapper">
                <button
                  key="all"
                  onClick={() => setSelectedCategory('')}
                  className={`search-category-btn ${
                    selectedCategory === ''
                      ? 'search-category-btn-active'
                      : 'search-category-btn-inactive'
                  }`}
                >
                  <span className="text-2xl">🎯</span>
                  <span>Toutes catégories</span>
                </button>

                {CATEGORIES.map((category) => (
                  <button
                    key={category.key}
                    onClick={() => setSelectedCategory(category.key)}
                    className={`search-category-btn ${
                      selectedCategory === category.key
                        ? 'search-category-btn-active'
                        : 'search-category-btn-inactive'
                    }`}
                  >
                    <div className="w-6 h-6 flex items-center justify-center">
                      {category.icon}
                    </div>
                    <span>{category.frenchLabel}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Étapes */}
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
            <TunisiaMap onGovernorateClick={setSelectedGovernorate} />
          </div>
        </div>
      )}

      {/* ── Vue résultats ── */}
      {selectedGovernorate && (
        <div className="search-results-container">
          <div className="search-results-header">
            <div className="search-results-header-content">
              <button onClick={handleBackToMap} className="search-back-btn">
                <ChevronLeftIcon className="w-5 h-5" />
                Retour à la carte
              </button>
              <h1 className="search-results-title">{selectedGovernorate}</h1>
              <p className="search-results-subtitle">
                {selectedCategory
                  ? CATEGORIES.find((c) => c.key === selectedCategory)?.frenchLabel
                  : 'Tous services'}
              </p>
            </div>
          </div>

          <div className="search-results-content">
            {/* Filtres */}
            <div className="search-filters">
              <div className="search-filters-grid">
                <div className="search-filter-group">
                  <label className="search-filter-label">Note minimale</label>
                  <select
                    className="search-filter-select"
                    value={filters.minRating}
                    onChange={(e) => setFilters({ minRating: Number(e.target.value) })}
                  >
                    <option value={0}>Toutes les notes</option>
                    <option value={4.5}>4.5+ étoiles</option>
                    <option value={4}>4+ étoiles</option>
                    <option value={3.5}>3.5+ étoiles</option>
                    <option value={3}>3+ étoiles</option>
                  </select>
                </div>

                {(selectedCategory || filters.minRating > 0) && (
                  <div className="search-filter-group">
                    <button onClick={resetFilters} className="btn btn-ghost text-sm mt-6">
                      Réinitialiser les filtres
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Loading */}
            {loading && (
              <div className="search-loading">
                <div className="search-spinner" />
                <p className="search-loading-text">Chargement des services...</p>
              </div>
            )}

            {/* Error */}
            {error && !loading && (
              <div className="search-error">
                <p className="search-error-text">{error}</p>
                <button onClick={handleBackToMap} className="search-error-btn">
                  Retour à la carte
                </button>
              </div>
            )}

            {/* No results */}
            {!loading && !error && services.length === 0 && (
              <div className="search-empty">
                <SearchIcon className="w-12 h-12 text-muted mx-auto mb-3" />
                <p className="search-empty-title">Aucun service trouvé dans cette région</p>
                <p className="search-empty-desc">
                  Essayez de modifier vos filtres ou choisissez une autre région
                </p>
                <button onClick={handleBackToMap} className="search-empty-btn">
                  Explorer d'autres régions
                </button>
              </div>
            )}

            {/* Results */}
            {!loading && !error && services.length > 0 && (
              <>
                <div className="search-results-count">
                  <p className="search-results-count-text">
                    {services.length} service{services.length > 1 ? 's' : ''} trouvé
                    {services.length > 1 ? 's' : ''}
                  </p>
                </div>
                <div className="search-results-grid">
                  {services.map((service) => (
                    <ServiceCard
                      key={service._id}
                      service={service as any} // Solution temporaire
                      showFavorite={true}
                      onClick={() => handleServiceClick(service as any)}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── Modal de détails (partagé entre les deux vues) ── */}
      {showModal && selectedService && (
        <ServiceDetailsModal
          service={selectedService}
          onClose={handleCloseModal}
          onBook={handleViewFullDetails}
        />
      )}
    </>
  );
}