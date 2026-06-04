'use client';

import { CATEGORIES } from "@/lib/api/constants/categories.";

// Type partagé pour les filtres
export interface FilterState {
  category: string;
  minPrice: number;
  maxPrice: number;
  radius: number;
}

interface FilterBarProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
}

export default function FilterBar({ filters, onFilterChange }: FilterBarProps) {
  const progressPercent = ((filters.radius - 1) / (50 - 1)) * 100;

  // Vérifier si des filtres sont actifs (hors valeurs par défaut)
  const hasActiveFilters = filters.category !== '' || filters.radius !== 10;

  return (
    <div className="filterbar">
      <div className="filterbar__inner">
        <div className="filterbar__row">

          {/* ── Catégorie ── */}
          <div className="filterbar__group filterbar__group--category">
            <label className="filterbar__label">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <rect x="3" y="3" width="7" height="7" rx="1"/>
                <rect x="14" y="3" width="7" height="7" rx="1"/>
                <rect x="3" y="14" width="7" height="7" rx="1"/>
                <rect x="14" y="14" width="7" height="7" rx="1"/>
              </svg>
              Catégorie
            </label>
            <div className="filterbar__select-wrapper">
              <select
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
            <label className="filterbar__label">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="12" cy="12" r="3"/>
                <path d="M12 2v3M12 19v3M2 12h3M19 12h3"/>
              </svg>
              Rayon de recherche
            </label>
            <div className="filterbar__radius-ctrl">
              <span className="filterbar__radius-val">{filters.radius} km</span>
              <input
                type="range"
                min="1"
                max="50"
                value={filters.radius}
                className="filterbar__range"
                style={{
                  '--progress': `${((filters.radius - 1) / 49) * 100}%`,
                } as React.CSSProperties}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  e.currentTarget.style.setProperty(
                    '--progress',
                    `${((val - 1) / 49) * 100}%`
                  );
                  onFilterChange({ ...filters, radius: val });
                }}
              />
            </div>
          </div>

          {/* ── Reset (si filtres actifs) ── */}
          {hasActiveFilters && (
            <div className="filterbar__group" style={{ flex: 'none' }}>
              <label className="filterbar__label" style={{ visibility: 'hidden' }}>‎</label>
              <button
                className="filterbar__clear-btn"
                onClick={() => onFilterChange({
                  ...filters,
                  category: '',
                  radius: 10
                })}
              >
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M18 6 6 18M6 6l12 12"/>
                </svg>
                Effacer
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}