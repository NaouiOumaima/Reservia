// app/client/search/page.tsx

'use client';

import { useState, useEffect, useCallback } from 'react';
import TunisiaMap from '@/components/charts/TunisiaMap';
import ServiceCard from '@/components/service/ServiceCard';
import { useServices } from '@/features/services/hooks/useServices';
import { GOVERNORATE_COORDINATES } from '@/lib/api/constants/governorates';
import {
  SearchIcon,
  StarIcon,
  LocationIcon,
  AllCategoriesIcon,
  ChevronLeftIcon,
} from '@/components/ui/Icons';
import { CATEGORIES, CategoryKey } from '@/lib/api/constants/categories';

// ─── Liste catégories ─────────────────────────────────────────────────────────
const CATEGORY_LIST = [
  { label: '' as CategoryKey | '', frenchLabel: 'Toutes catégories', IconComponent: AllCategoriesIcon },
  ...CATEGORIES.map((cat) => ({
    label: cat.key,
    frenchLabel: cat.frenchLabel,
    IconComponent: cat.IconComponent,
  })),
];

// ✅ Supprimer les filtres de prix car services gratuits
interface FiltersState {
  minRating: number;
}

const DEFAULT_FILTERS: FiltersState = { minRating: 0 };

export default function SearchPage() {
  const { services, loading, error, search } = useServices();

  const [selectedGovernorate, setSelectedGovernorate] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<CategoryKey | ''>('');
  const [filters, setFilters] = useState<FiltersState>(DEFAULT_FILTERS);

  // ─── Recherche ────────────────────────────────────────────────────────────
  const performSearch = useCallback(async () => {
    if (!selectedGovernorate) return;
    const coords = GOVERNORATE_COORDINATES[selectedGovernorate as keyof typeof GOVERNORATE_COORDINATES];
    if (!coords) return;

    await search('', {
      category: selectedCategory || undefined,
      minRating: filters.minRating > 0 ? filters.minRating : undefined,
      location: { lat: coords.lat, lng: coords.lng, radius: 20 },
    });
  }, [selectedGovernorate, selectedCategory, filters, search]);

  useEffect(() => { performSearch(); }, [performSearch]);

  // ─── Handlers ─────────────────────────────────────────────────────────────
  const handleGovernorateClick = (gov: string) => {
    setSelectedGovernorate(gov);
    setSelectedCategory('');
    setFilters(DEFAULT_FILTERS);
  };

  const handleBackToMap = () => {
    setSelectedGovernorate(null);
    setSelectedCategory('');
    setFilters(DEFAULT_FILTERS);
  };

  const handleRatingChange = (value: number) =>
    setFilters((prev) => ({ ...prev, minRating: value }));

  const resetFilters = () => {
    setSelectedCategory('');
    setFilters(DEFAULT_FILTERS);
  };

  const hasActiveFilters = selectedCategory !== '' || filters.minRating > 0;

  // ─── Vue carte ────────────────────────────────────────────────────────────
  if (!selectedGovernorate) {
    return (
      <div className="search-page-container">
        <div className="search-page-content">
          <div className="search-categories">
            <div className="search-categories-wrapper">
              {CATEGORY_LIST.map(({ label, frenchLabel, IconComponent }) => (
                <button
                  key={label || 'all'}
                  onClick={() => setSelectedCategory(label)}
                  className={`search-category-btn ${
                    selectedCategory === label
                      ? 'search-category-btn-active'
                      : 'search-category-btn-inactive'
                  }`}
                >
                  <IconComponent className="w-5 h-5" />
                  <span>{frenchLabel}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="search-steps">
            <div className="search-step">
              <div className="search-step-number">1</div>
              <div className="search-step-content">
                <div className="search-step-icon"><LocationIcon className="w-6 h-6" /></div>
                <h3 className="search-step-title">Choisissez une région</h3>
                <p className="search-step-desc">Cliquez sur un gouvernorat sur la carte</p>
              </div>
              <div className="search-step-arrow">→</div>
            </div>
            <div className="search-step">
              <div className="search-step-number">2</div>
              <div className="search-step-content">
                <div className="search-step-icon"><SearchIcon className="w-6 h-6" /></div>
                <h3 className="search-step-title">Filtrez par catégorie</h3>
                <p className="search-step-desc">Sélectionnez le type de service souhaité</p>
              </div>
              <div className="search-step-arrow">→</div>
            </div>
            <div className="search-step">
              <div className="search-step-number">3</div>
              <div className="search-step-content">
                <div className="search-step-icon"><StarIcon className="w-6 h-6" /></div>
                <h3 className="search-step-title">Réservez</h3>
                <p className="search-step-desc">Parcourez et réservez en quelques clics</p>
              </div>
            </div>
          </div>

          <TunisiaMap onGovernorateClick={handleGovernorateClick} />
        </div>
      </div>
    );
  }

  // ─── Vue résultats ────────────────────────────────────────────────────────
  return (
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
              ? CATEGORY_LIST.find((c) => c.label === selectedCategory)?.frenchLabel
              : 'Tous services'}
          </p>
        </div>
      </div>

      <div className="search-results-content">
        {/* Filtre catégories */}
        <div className="search-categories search-categories--compact">
          <div className="search-categories-wrapper">
            {CATEGORY_LIST.map(({ label, frenchLabel, IconComponent }) => (
              <button
                key={label || 'all'}
                onClick={() => setSelectedCategory(label)}
                className={`search-category-btn ${
                  selectedCategory === label
                    ? 'search-category-btn-active'
                    : 'search-category-btn-inactive'
                }`}
              >
                <IconComponent className="w-4 h-4" />
                <span>{frenchLabel}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Filtre note uniquement (services gratuits) */}
        <div className="search-filters">
          <div className="search-filters-grid">
            <div className="search-filter-group">
              <label className="search-filter-label">Note minimum</label>
              <select
                className="search-filter-select"
                value={filters.minRating}
                onChange={(e) => handleRatingChange(Number(e.target.value))}
              >
                <option value={0}>Toutes les notes</option>
                <option value={3}>3+ étoiles</option>
                <option value={4}>4+ étoiles</option>
                <option value={4.5}>4.5+ étoiles</option>
              </select>
            </div>
            {hasActiveFilters && (
              <div className="search-filter-group flex items-end">
                <button onClick={resetFilters} className="btn btn-ghost text-sm w-full">
                  Réinitialiser les filtres
                </button>
              </div>
            )}
          </div>
        </div>

        {/* États */}
        {loading ? (
          <div className="search-loading">
            <div className="search-spinner" />
            <p className="search-loading-text">Chargement des services...</p>
          </div>
        ) : error ? (
          <div className="search-error">
            <p className="search-error-text">{error}</p>
            <button onClick={performSearch} className="search-error-btn">Réessayer</button>
          </div>
        ) : services.length === 0 ? (
          <div className="search-empty">
            <div className="search-empty-icon">🔍</div>
            <p className="search-empty-title">Aucun service gratuit trouvé dans cette région</p>
            <p className="search-empty-desc">Essayez une autre région ou modifiez vos filtres</p>
            {hasActiveFilters && (
              <button onClick={resetFilters} className="search-empty-btn">
                Supprimer les filtres
              </button>
            )}
            <button onClick={handleBackToMap} className="search-empty-btn" style={{ marginTop: '0.5rem' }}>
              Explorer d'autres régions
            </button>
          </div>
        ) : (
          <>
            <div className="search-results-count">
              <p className="search-results-count-text">
                {services.length} service{services.length > 1 ? 's' : ''} gratuit{services.length > 1 ? 's' : ''} trouvé{services.length > 1 ? 's' : ''}
              </p>
              {hasActiveFilters && (
                <button onClick={resetFilters} className="text-sm text-primary hover:underline">
                  Effacer les filtres
                </button>
              )}
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