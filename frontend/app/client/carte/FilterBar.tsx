'use client';

import { CATEGORIES } from "@/lib/api/constants/categories.";

export interface FilterState {
  category: string;
  radius: number;
}

interface FilterBarProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
}

export default function FilterBar({ filters, onFilterChange }: FilterBarProps) {
  const hasActiveFilters = filters.category !== '' || filters.radius !== 10;

  const updateProgress = (val: number) => {
    return `${((val - 1) / 49) * 100}%`;
  };

  const handleRadiusChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value);
    e.currentTarget.style.setProperty('--fb-progress', updateProgress(val));
    onFilterChange({ ...filters, radius: val });
  };

  return (
    <div className="filterbar">
      <div className="filterbar__row">

        {/* ── Catégorie ── */}
        <div className="filterbar__group filterbar__group--category">
          <label className="filterbar__label" htmlFor="fb-cat">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
              <rect x="3" y="3" width="7" height="7" rx="1.5"/>
              <rect x="14" y="3" width="7" height="7" rx="1.5"/>
              <rect x="3" y="14" width="7" height="7" rx="1.5"/>
              <rect x="14" y="14" width="7" height="7" rx="1.5"/>
            </svg>
            Catégorie
          </label>
          <div className="filterbar__select-wrapper">
            <select
              id="fb-cat"
              className="filterbar__select"
              value={filters.category}
              onChange={(e) => onFilterChange({ ...filters, category: e.target.value })}
            >
              <option value="">— Toutes les catégories —</option>
              {CATEGORIES.map((cat) => (
                <option key={cat.key} value={cat.key}>
                  {cat.frenchLabel}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* ── Rayon ── */}
        <div className="filterbar__group filterbar__group--radius">
          <label className="filterbar__label" htmlFor="fb-radius">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
              <circle cx="12" cy="12" r="3"/>
              <path d="M12 2v3M12 19v3M2 12h3M19 12h3"/>
            </svg>
            Rayon de recherche
          </label>
          <div className="filterbar__radius-ctrl">
            <span className="filterbar__radius-val">{filters.radius} km</span>
            <input
              id="fb-radius"
              type="range"
              min="1"
              max="50"
              step="1"
              value={filters.radius}
              className="filterbar__range"
              style={{ '--fb-progress': updateProgress(filters.radius) } as React.CSSProperties}
              onChange={handleRadiusChange}
            />
          </div>
        </div>

        {/* ── Effacer (conditionnel) ── */}
        {hasActiveFilters && (
          <div className="filterbar__group filterbar__group--action" style={{ alignSelf: 'flex-end' }}>
            <button
              className="filterbar__clear-btn"
              onClick={() => onFilterChange({ ...filters, category: '', radius: 10 })}
              aria-label="Effacer les filtres"
            >
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                <path d="M18 6 6 18M6 6l12 12"/>
              </svg>
              Effacer
            </button>
          </div>
        )}
      </div>
    </div>
  );
}