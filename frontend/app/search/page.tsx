// app/search/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { useServices } from '@/features/services/hooks/useServices';
import SearchBar from '@/components/ui/SearchBar';
import Map from '@/components/map/Map';
import type { SearchFilters } from '@/types';
import ServiceCard from '@/components/service/ServiceCard';

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<SearchFilters>({
    category: '',
    minPrice: undefined,
    maxPrice: undefined,
    minRating: undefined,
    sortBy: 'smart',
  });
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const { services, loading, error, search } = useServices();

  // Get user location
  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error('Geolocation error:', error);
        }
      );
    }
  }, []);

  // Update filters with location
  useEffect(() => {
    if (userLocation && !filters.location) {
      setFilters(prev => ({
        ...prev,
        location: {
          lng: userLocation.lng,
          lat: userLocation.lat,
          radius: 10,
        },
      }));
    }
  }, [userLocation, filters.location]);

  useEffect(() => {
    if (searchQuery) {
      search(searchQuery, filters);
    }
  }, [searchQuery, filters, search]);

  const handleFilterChange = (newFilters: Partial<SearchFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const handleNearMe = () => {
    if (userLocation) {
      setFilters(prev => ({
        ...prev,
        location: {
          lng: userLocation.lng,
          lat: userLocation.lat,
          radius: 10,
        },
      }));
      if (searchQuery) {
        search(searchQuery, {
          ...filters,
          location: {
            lng: userLocation.lng,
            lat: userLocation.lat,
            radius: 10,
          },
        });
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <SearchBar 
          onSearch={setSearchQuery} 
          onFilterChange={handleFilterChange}
          onNearMe={handleNearMe}
        />

        {/* View Toggle */}
        <div className="flex justify-between items-center mb-4">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {services.length} service(s) trouvé(s)
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('list')}
              className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                viewMode === 'list' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              Liste
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                viewMode === 'map' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
              Carte
            </button>
          </div>
        </div>

        {error && (
          <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-4 mb-4">
            <p className="text-sm font-medium text-red-800 dark:text-red-400">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Chargement des services...</p>
          </div>
        ) : viewMode === 'list' ? (
          <>
            {services.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🔍</div>
                <p className="text-gray-500 dark:text-gray-400">Aucun service trouvé</p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                  Essayez de modifier vos critères de recherche
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {services.map((service) => (
                  <ServiceCard key={service._id} service={service} />
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
            {services.length > 0 ? (
              <Map services={services} center={userLocation || undefined} />
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500">Aucun service à afficher sur la carte</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}