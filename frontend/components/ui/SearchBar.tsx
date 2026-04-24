// components/ui/SearchBar.tsx

'use client';

import { useState, useRef } from 'react';
import type { SearchFilters } from '@/types';

interface SearchBarProps {
  onSearch: (query: string) => void;
  onFilterChange: (filters: Partial<SearchFilters>) => void;
  onNearMe?: () => void;
}

export default function SearchBar({ onSearch, onFilterChange, onNearMe }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const [sortBy, setSortBy] = useState<SearchFilters['sortBy']>('smart');
  const [priceRange, setPriceRange] = useState<{ min?: number; max?: number }>({});
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  const handleSearch = () => {
    onSearch(query);
  };

  const handleSortChange = (value: SearchFilters['sortBy']) => {
    setSortBy(value);
    onFilterChange({ sortBy: value });
  };

  const handleCategoryChange = (value: string) => {
    setCategory(value);
    onFilterChange({ category: value });
  };

  const handlePriceChange = (min?: number, max?: number) => {
    setPriceRange({ min, max });
    onFilterChange({ minPrice: min, maxPrice: max });
  };

  const handleRatingChange = (rating?: number) => {
    onFilterChange({ minRating: rating });
  };

  // Voice search
  const startVoiceSearch = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert('La reconnaissance vocale n\'est pas supportée sur ce navigateur');
      return;
    }

    const SpeechRecognition = (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'fr-FR';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setQuery(transcript);
      onSearch(transcript);
      setIsListening(false);
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
    recognitionRef.current = recognition;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mb-6">
      <div className="flex gap-4 mb-4">
        <div className="flex-1 relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Rechercher un service... (ex: restaurant, hôtel, coiffeur)"
            className="w-full px-4 py-2 pr-12 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={startVoiceSearch}
            className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full transition-colors ${
              isListening 
                ? 'bg-red-500 text-white animate-pulse' 
                : 'text-gray-400 hover:text-blue-500'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          </button>
        </div>
        <button
          onClick={handleSearch}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Rechercher
        </button>
        {onNearMe && (
          <button
            onClick={onNearMe}
            className="px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Près de moi
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <select
          value={category}
          onChange={(e) => handleCategoryChange(e.target.value)}
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Toutes les catégories</option>
          <option value="restaurant">🍽️ Restaurant</option>
          <option value="hotel">🏨 Hôtel</option>
          <option value="gym">💪 Salle de sport</option>
          <option value="salon">💇 Salon de beauté</option>
          <option value="spa">💆 Spa</option>
          <option value="repair">🔧 Réparation</option>
          <option value="medical">🏥 Médical</option>
          <option value="education">📚 Éducation</option>
        </select>

        <select
          value={sortBy}
          onChange={(e) => handleSortChange(e.target.value as SearchFilters['sortBy'])}
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="smart">🤖 Tri intelligent</option>
          <option value="price">💰 Prix croissant</option>
          <option value="price_desc">💰 Prix décroissant</option>
          <option value="rating">⭐ Meilleures notes</option>
          <option value="distance">📍 Distance</option>
        </select>

        <div className="flex gap-2">
          <input
            type="number"
            placeholder="Prix min"
            value={priceRange.min || ''}
            onChange={(e) => handlePriceChange(e.target.value ? Number(e.target.value) : undefined, priceRange.max)}
            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="number"
            placeholder="Prix max"
            value={priceRange.max || ''}
            onChange={(e) => handlePriceChange(priceRange.min, e.target.value ? Number(e.target.value) : undefined)}
            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <select
          onChange={(e) => handleRatingChange(e.target.value ? Number(e.target.value) : undefined)}
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">⭐ Note minimum</option>
          <option value="4.5">4.5+ étoiles</option>
          <option value="4">4+ étoiles</option>
          <option value="3.5">3.5+ étoiles</option>
          <option value="3">3+ étoiles</option>
          <option value="2">2+ étoiles</option>
        </select>
      </div>
    </div>
  );
}