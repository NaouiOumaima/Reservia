'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { CATEGORIES } from '@/lib/api/constants/categories';
import {
  FilterIcon,
  MapPinIcon,
  SearchIcon,
  XIcon,
} from '@/components/ui/Icons';


interface FilterBarProps {
  filters: {
    category: string;
    radius: number;
    searchTerm?: string;
  };
  onFilterChange: (filters: any) => void;
  onSearch?: (searchTerm: string) => void;
}

export default function FilterBar({ filters, onFilterChange, onSearch }: FilterBarProps) {
  const [isRadiusPulsing, setIsRadiusPulsing]   = useState(false);
  const [localSearchTerm, setLocalSearchTerm]   = useState(filters.searchTerm || '');
  const [isSearching, setIsSearching]           = useState(false);
  const rangeRef       = useRef<HTMLInputElement>(null);
  const searchTimeout  = useRef<ReturnType<typeof setTimeout>>();

  /* ── Synchronise le dégradé de la piste du slider ── */
  const updateRangeTrack = useCallback((value: number) => {
    if (!rangeRef.current) return;
    const pct = ((value - 1) / (50 - 1)) * 100;
    rangeRef.current.style.setProperty('--progress', `${pct}%`);
  }, []);

  useEffect(() => {
    updateRangeTrack(filters.radius);
  }, [filters.radius, updateRangeTrack]);

  /* ── Recherche avec debounce ── */
  const debouncedSearch = useCallback(
    (term: string) => {
      clearTimeout(searchTimeout.current);
      searchTimeout.current = setTimeout(() => {
        setIsSearching(true);
        onSearch?.(term);
        onFilterChange({ ...filters, searchTerm: term });
        setTimeout(() => setIsSearching(false), 300);
      }, 500);
    },
    [filters, onSearch, onFilterChange],
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocalSearchTerm(value);
    debouncedSearch(value);
  };

  const clearSearch = () => {
    setLocalSearchTerm('');
    debouncedSearch('');
  };

  /* ── Rayon ── */
  const handleRadiusChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseInt(e.target.value, 10);
    setIsRadiusPulsing(true);
    onFilterChange({ ...filters, radius: v });
    updateRangeTrack(v);
    setTimeout(() => setIsRadiusPulsing(false), 600);
  };

  /* ── Catégorie ── */
  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange({ ...filters, category: e.target.value });
  };

  return (
    <div className="filterbar">
      <div className="filterbar__inner">
        <div className="filterbar__row">

          {/* ── Recherche ── */}
          <div className="filterbar__group filterbar__group--search">
            <label className="filterbar__label" htmlFor="fb-search">
              <SearchIcon className="icon-xs" aria-hidden />
              <span>Rechercher un service</span>
            </label>
            <div className="filterbar__search-wrapper">
              <input
                id="fb-search"
                type="text"
                value={localSearchTerm}
                onChange={handleSearchChange}
                placeholder="Nom du service, mots-clés…"
                className="filterbar__search-input"
                aria-label="Rechercher un service par nom"
              />
              {isSearching && (
                <div className="filterbar__search-spinner" aria-hidden>
                  <div className="spinner" />
                </div>
              )}
              {localSearchTerm && !isSearching && (
                <button
                  onClick={clearSearch}
                  className="filterbar__search-clear"
                  aria-label="Effacer la recherche"
                  type="button"
                >
                  <XIcon className="icon-xs" />
                </button>
              )}
            </div>
          </div>

          {/* ── Catégorie ── */}
          <div className="filterbar__group filterbar__group--category">
            <label className="filterbar__label" htmlFor="fb-category">
              <FilterIcon className="icon-xs" aria-hidden />
              <span>Catégorie</span>
            </label>
            <select
              id="fb-category"
              value={filters.category}
              onChange={handleCategoryChange}
              className="filterbar__select"
            >
              <option value="">Toutes les catégories</option>
              {CATEGORIES.map((cat) => (
                <option key={cat.key} value={cat.label}>
                  {cat.frenchLabel}
                </option>
              ))}
            </select>
          </div>

          {/* ── Rayon ── */}
          <div className="filterbar__group filterbar__group--radius">
            <label className="filterbar__label" htmlFor="fb-radius">
              <MapPinIcon className="icon-xs" aria-hidden />
              <span>Rayon de recherche</span>
            </label>
            <div className="filterbar__radius-ctrl">
              <span
                className={[
                  'filterbar__radius-val',
                  isRadiusPulsing ? 'filterbar__radius-val--active' : '',
                ].join(' ')}
                aria-live="polite"
                aria-label={`${filters.radius} kilomètres`}
              >
                {filters.radius} km
              </span>
              <input
                ref={rangeRef}
                id="fb-radius"
                type="range"
                min="1"
                max="50"
                step="1"
                value={filters.radius}
                onChange={handleRadiusChange}
                className="filterbar__range"
                aria-label="Rayon de recherche en kilomètres"
              />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}