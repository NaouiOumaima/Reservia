// components/service/ServiceCard.tsx

'use client';

import Link from 'next/link';
import { Service } from '@/types';
import Image from 'next/image';

interface ServiceCardProps {
  service: Service;
  onBook?: (service: Service) => void;
}

export default function ServiceCard({ service, onBook }: ServiceCardProps) {
  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      restaurant: '🍽️',
      hotel: '🏨',
      gym: '💪',
      salon: '💇',
      spa: '💆',
      repair: '🔧',
      medical: '🏥',
      education: '📚',
    };
    return icons[category] || '📍';
  };

  return (
    <Link href={`/service/${service._id}`}>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden cursor-pointer group">
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
              <span className="text-6xl">{getCategoryIcon(service.category)}</span>
            </div>
          )}
          {service.discountPrice && (
            <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-lg text-xs font-bold">
              -{Math.round((1 - service.discountPrice / service.price) * 100)}%
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-semibold text-gray-900 dark:text-white text-lg line-clamp-1">
              {service.name}
            </h3>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {getCategoryIcon(service.category)}
            </span>
          </div>

          <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-3">
            {service.description}
          </p>

          <div className="flex items-center gap-2 mb-3">
            <div className="flex items-center">
              <span className="text-yellow-500">⭐</span>
              <span className="ml-1 text-sm font-semibold text-gray-900 dark:text-white">
                {service.rating.toFixed(1)}
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

          <div className="flex items-center justify-between">
            <div>
              {service.discountPrice ? (
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                    {service.discountPrice} DT
                  </span>
                  <span className="text-sm text-gray-400 line-through">
                    {service.price} DT
                  </span>
                </div>
              ) : (
                <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                  {service.price} DT
                </span>
              )}
            </div>
            {onBook && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  onBook(service);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                Réserver
              </button>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}