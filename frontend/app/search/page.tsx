// app/search/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import TunisiaMap from '@/components/charts/TunisiaMap';
import ServiceCard from '@/components/service/ServiceCard';
import ServiceDetailsModal from '@/components/service/ServiceDetailsModal';
import { useServices } from '@/features/services/hooks/useServices';
import { GOVERNORATE_COORDINATES } from '@/lib/api/constants/governorates';
import { SearchIcon, StarIcon, LocationIcon, ChevronLeftIcon, GridIcon } from '@/components/ui/Icons';
import type { Service } from '@/lib/api/services/types';
import {
  CATEGORIES,
  CategoryIcon,
  CategoryKey,
  getCategoryFrenchLabel,
} from '@/lib/api/constants/categories.';

export default function SearchPage() {
  const router = useRouter();
  const { services, loading, error, search } = useServices();

  const [selectedGovernorate, setSelectedGovernorate] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [filters, setFilters] = useState({ minRating: 0 });
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [showModal, setShowModal] = useState(false);

  const displayCategories = CATEGORIES.filter((c) => c.key !== CategoryKey.ALL);

  useEffect(() => {
    if (!selectedGovernorate) return;
    const coords =
      GOVERNORATE_COORDINATES[selectedGovernorate as keyof typeof GOVERNORATE_COORDINATES];
    if (!coords) return;

    search('', {
      category: selectedCategory || undefined,
      minRating: filters.minRating > 0 ? filters.minRating : undefined,
      location: { lat: coords.lat, lng: coords.lng, radius: 50 },
    });
  }, [selectedGovernorate, selectedCategory, filters, search]);

  const handleBackToMap = () => {
    setSelectedGovernorate(null);
    setSelectedCategory('');
    setFilters({ minRating: 0 });
  };

  const handleServiceClick = (service: Service) => {
    setSelectedService(service);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedService(null);
  };

  const handleViewFullDetails = (service: Service) => {
    setShowModal(false);
    router.push(`/service/${service._id}`);
  };

  const getCategoryLabel = (key: string) =>
    key ? getCategoryFrenchLabel(key) : 'Toutes catégories';

  const activeCategory = CATEGORIES.find((c) => c.key === selectedCategory);

  /* ────────────────────────────────────────────────
     VUE CARTE
  ──────────────────────────────────────────────── */
  if (!selectedGovernorate) {
    return (
      <div className="sp-page">
        <div className="sp-content">

          {/* ── Catégories ── */}
          <div className="sp-categories">
            <div className="sp-categories-inner">

              {/* Toutes */}
              <button
                onClick={() => setSelectedCategory('')}
                className={`sp-cat-btn ${selectedCategory === '' ? 'sp-cat-btn--active' : ''}`}
              >
                <span className="sp-cat-btn-icon">
                  <GridIcon className="w-5 h-5" />
                </span>
                <span>Toutes catégories</span>
              </button>

              {displayCategories.map((cat) => (
                <button
                  key={cat.key}
                  onClick={() => setSelectedCategory(cat.key)}
                  className={`sp-cat-btn ${selectedCategory === cat.key ? 'sp-cat-btn--active' : ''}`}
                >
                  <span
                    className="sp-cat-btn-icon"
                    style={{ color: selectedCategory === cat.key ? '#fff' : cat.color }}
                  >
                    <CategoryIcon category={cat.key} className="w-5 h-5" />
                  </span>
                  <span>{cat.frenchLabel}</span>
                </button>
              ))}
            </div>
          </div>

          {/* ── Étapes ── */}
          <div className="sp-steps">
            <div className="sp-step">
              <div className="sp-step-num">1</div>
              <div className="sp-step-icon">
                <LocationIcon className="w-5 h-5" />
              </div>
              <div className="sp-step-body">
                <h3 className="sp-step-title">Choisissez une région</h3>
                <p className="sp-step-desc">Cliquez sur un gouvernorat sur la carte</p>
              </div>
              <span className="sp-step-arrow">→</span>
            </div>

            <div className="sp-step">
              <div className="sp-step-num">2</div>
              <div className="sp-step-icon">
                <SearchIcon className="w-5 h-5" />
              </div>
              <div className="sp-step-body">
                <h3 className="sp-step-title">Filtrez par catégorie</h3>
                <p className="sp-step-desc">Sélectionnez le type de service souhaité</p>
              </div>
              <span className="sp-step-arrow">→</span>
            </div>

            <div className="sp-step">
              <div className="sp-step-num">3</div>
              <div className="sp-step-icon">
                <StarIcon className="w-5 h-5" />
              </div>
              <div className="sp-step-body">
                <h3 className="sp-step-title">Réservez</h3>
                <p className="sp-step-desc">Parcourez et réservez en quelques clics</p>
              </div>
            </div>
          </div>

          {/* ── Carte Tunisie ── */}
          <div className="sp-map-slot">
            <TunisiaMap onGovernorateClick={setSelectedGovernorate} />
          </div>
        </div>
      </div>
    );
  }

  /* ────────────────────────────────────────────────
     VUE RÉSULTATS
  ──────────────────────────────────────────────── */
  return (
    <>
      <div className="sp-results-page">

        {/* Header */}
        <div className="sp-results-header">
          <div className="sp-results-header-row">
            <button onClick={handleBackToMap} className="sp-back-btn">
              <ChevronLeftIcon className="w-4 h-4" />
              <span>Retour à la carte</span>
            </button>
            <div style={{ flex: 1 }}>
              <h1 className="sp-results-title">{selectedGovernorate}</h1>
              <p className="sp-results-subtitle">{getCategoryLabel(selectedCategory)}</p>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(.65rem,1.8vw,1.1rem)' }}>

          {/* Filtres */}
          <div className="sp-filters-bar">
            <div className="sp-filters-grid">
              <div className="sp-filter-group">
                <label className="sp-filter-label">Note minimale</label>
                <select
                  className="sp-filter-select"
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
                <div className="sp-filter-group" style={{ justifyContent: 'flex-end' }}>
                  <button onClick={() => { setSelectedCategory(''); setFilters({ minRating: 0 }); }} className="sp-reset-btn">
                    ✕ Réinitialiser
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Chip filtre actif */}
          {selectedCategory && activeCategory && (
            <div className="sp-active-filters">
              <span className="sp-active-filters-label">Filtre actif :</span>
              <span
                className="sp-active-filter-chip"
                style={{
                  background: `${activeCategory.color}18`,
                  color: activeCategory.color,
                }}
              >
                <CategoryIcon category={selectedCategory} className="w-3.5 h-3.5" />
                {getCategoryLabel(selectedCategory)}
                <button className="sp-remove-chip" onClick={() => setSelectedCategory('')}>
                  ✕
                </button>
              </span>
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className="sp-state-box sp-loading">
              <div className="sp-spinner" />
              <p className="sp-loading-text">Chargement des services…</p>
            </div>
          )}

          {/* Erreur */}
          {error && !loading && (
            <div className="sp-state-box sp-error">
              <p className="sp-error-text">{error}</p>
              <button onClick={handleBackToMap} className="sp-cta-btn">
                Retour à la carte
              </button>
            </div>
          )}

          {/* Vide */}
          {!loading && !error && services.length === 0 && (
            <div className="sp-state-box sp-empty">
              <span className="sp-empty-icon">🔍</span>
              <p className="sp-empty-title">Aucun service trouvé dans cette région</p>
              <p className="sp-empty-desc">
                Essayez de modifier vos filtres ou choisissez une autre région
              </p>
              <button onClick={handleBackToMap} className="sp-cta-btn">
                Explorer d'autres régions
              </button>
            </div>
          )}

          {/* Résultats */}
          {!loading && !error && services.length > 0 && (
            <>
              <div className="sp-count-bar">
                <p className="sp-count-text">
                  <span className="sp-count-num">{services.length}</span>{' '}
                  service{services.length > 1 ? 's' : ''} trouvé
                  {services.length > 1 ? 's' : ''}
                </p>
              </div>

              <div className="sp-grid">
                {services.map((service) => (
                  <ServiceCard
                    key={service._id}
                    service={service as any}
                    showFavorite
                    onClick={() => handleServiceClick(service as any)}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Modal */}
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