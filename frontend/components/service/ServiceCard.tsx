// components/service/ServiceCard.tsx
'use client';

import Image from 'next/image';
import { useAuth } from '@/providers/AuthProvider';
import FavoriteButton from '@/components/FavoriteButton';
import { Service } from '@/types';
import { CATEGORIES_MAP } from '@/lib/api/constants/categories.';

interface ServiceCardProps {
  service: Service;
  onBook?: (service: Service) => void;
  showFavorite?: boolean;
  onClick?: (service: Service) => void;
}

export default function ServiceCard({ service, onBook, showFavorite = false, onClick }: ServiceCardProps) {
  const { user } = useAuth();

  // Utiliser la catégorie depuis votre fichier de constantes
  const getCategoryInfo = (category: string) => {
    const categoryInfo = CATEGORIES_MAP.get(category);
    return {
      icon: categoryInfo?.icon || <span className="text-2xl">📍</span>,
      label: categoryInfo?.frenchLabel || category,
    };
  };

  const categoryInfo = getCategoryInfo(service.category);

  const handleCardClick = () => {
    if (onClick) {
      onClick(service);
    }
  };

  const cardContent = (
    <div 
      onClick={handleCardClick}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden cursor-pointer group"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleCardClick();
        }
      }}
    >
      {/* Image */}
      <div className="relative h-48 overflow-hidden">
        {service.images && service.images[0] ? (
          <Image
            src={service.images[0]}
            alt={service.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
            <div className="text-white text-4xl">
              {categoryInfo.icon}
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-2 gap-2">
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-gray-900 dark:text-white text-lg line-clamp-1">
              {service.name}
            </h3>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {showFavorite && user?.role === 'client' && (
              <FavoriteButton
                serviceId={service._id}
                size="sm"
                className="relative"
                onClick={(event) => event.stopPropagation()}
              />
            )}
          </div>
        </div>

        <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-3">
          {service.description}
        </p>

        <div className="flex items-center gap-2 mb-3">
          <div className="flex items-center">
            <span className="text-yellow-500">⭐</span>
            <span className="ml-1 text-sm font-semibold text-gray-900 dark:text-white">
              {(service.avgRating ?? 0).toFixed(1)}
            </span>
          </div>
          <span className="text-gray-300 dark:text-gray-600">•</span>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {service.reviewCount} avis
          </span>
          <span className="text-gray-300 dark:text-gray-600">•</span>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {service.duration} min
          </span>
        </div>

        {onBook && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onBook(service);
            }}
            className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            Réserver
          </button>
        )}
      </div>
    </div>
  );

  return cardContent;
}