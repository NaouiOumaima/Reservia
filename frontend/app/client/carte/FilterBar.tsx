'use client';

import { useState } from 'react';
import {
  RestaurantIcon,
  HotelIcon,
  SpaIcon,
  FitnessIcon,
  LipstickIcon,
} from '@/components/ui/Icons';

interface FilterBarProps {
  filters: { category: string; minPrice: number; maxPrice: number; radius: number };
  onFilterChange: (filters: any) => void;
}

const categories = [
  { value: '', label: 'Toutes catégories', icon: null },
  { value: 'restaurant', label: 'Restaurants', icon: <RestaurantIcon className="w-4 h-4" /> },
  { value: 'hotel', label: 'Hôtels', icon: <HotelIcon className="w-4 h-4" /> },
  { value: 'spa', label: 'Spa & Bien-être', icon: <SpaIcon className="w-4 h-4" /> },
  { value: 'gym', label: 'Salles de sport', icon: <FitnessIcon className="w-4 h-4" /> },
  { value: 'coiffeur', label: 'Coiffeurs & Salons', icon: <LipstickIcon className="w-4 h-4" /> },
];

export default function FilterBar({ filters, onFilterChange }: FilterBarProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Pour afficher l'icône à côté du texte dans le select, on ne peut pas facilement.
  // On garde le texte seul pour le select, mais on peut ajouter l'icône dans le label de l'option.
  // Solution : on affiche l'icône + texte via une structure personnalisée (non standard).
  // Ici on reste simple : on affiche le texte.
  return (
    <div className="filter-bar">
      <div className="filter-bar-container">
        <div className="filter-bar-row">
          <select
            value={filters.category}
            onChange={(e) => onFilterChange({ ...filters, category: e.target.value })}
            className="filter-select"
          >
            {categories.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>

          <div className="filter-price">
            <span>Max :</span>
            <input
              type="number"
              value={filters.maxPrice}
              min={0}
              onChange={(e) =>
                onFilterChange({ ...filters, maxPrice: parseInt(e.target.value) || 0 })
              }
              className="filter-input"
              placeholder="500"
            />
            <span>DT</span>
          </div>

          <div className="filter-radius">
            <span>Rayon :</span>
            <input
              type="range"
              min="1"
              max="50"
              value={filters.radius}
              onChange={(e) =>
                onFilterChange({ ...filters, radius: parseInt(e.target.value) })
              }
              className="filter-range"
            />
            <span>{filters.radius} km</span>
          </div>

          <button onClick={() => setIsExpanded(!isExpanded)} className="filter-expand-btn">
            {isExpanded ? '▲ Moins' : '▼ Plus de filtres'}
          </button>
        </div>

        {isExpanded && (
          <div className="filter-expanded">
            <div className="filter-price-min">
              <span>Prix min :</span>
              <input
                type="number"
                value={filters.minPrice}
                min={0}
                onChange={(e) =>
                  onFilterChange({ ...filters, minPrice: parseInt(e.target.value) || 0 })
                }
                className="filter-input"
                placeholder="0"
              />
              <span>DT</span>
            </div>

            <button
              onClick={() =>
                onFilterChange({ category: '', minPrice: 0, maxPrice: 500, radius: 10 })
              }
              className="filter-reset-btn"
            >
              Réinitialiser
            </button>
          </div>
        )}
      </div>
    </div>
  );
}