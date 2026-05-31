// components/service/ServiceCard.tsx
'use client';

import Link from 'next/link';
import Image from 'next/image';
import type { Service } from '@/lib/api/services/types';
import { CATEGORIES_MAP, getCategoryFrenchLabel } from '@/lib/api/constants';
import { MapPinIcon, StarIcon, ClockIcon } from '@/components/ui/Icons';

interface ServiceCardProps {
  service: Service;
  onBook?: (service: Service) => void;
}

export default function ServiceCard({ service, onBook }: ServiceCardProps) {
  const displayRating = service.avgRating ?? 0;

  const category = CATEGORIES_MAP.get(service.category);
  const IconComponent = category?.IconComponent;

  return (
    <Link href={`/client/service/${service._id}`} className="service-card-link">
      <div className="service-card">
        {/* Image */}
        <div className="service-card-image">
          {service.images?.[0] ? (
            <Image
              src={service.images[0]}
              alt={service.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="service-card-image-placeholder">
              {IconComponent && <IconComponent className="w-12 h-12 text-gray-400" />}
            </div>
          )}
          {/* Badge GRATUIT */}
          <div className="service-card-free-badge">
            🆓 GRATUIT
          </div>
        </div>

        {/* Content */}
        <div className="service-card-content">
          {/* Titre + catégorie */}
          <div className="service-card-header">
            <h3 className="service-card-title">
              {service.name}
            </h3>
            <span className="service-card-category">
              {getCategoryFrenchLabel(service.category)}
            </span>
          </div>

          {/* Description */}
          <p className="service-card-description">
            {service.description}
          </p>

          {/* Localisation */}
          {service.location?.city && (
            <div className="service-card-location">
              <MapPinIcon className="w-3 h-3" />
              <span>
                {service.location.city}
                {service.location.governorate ? `, ${service.location.governorate}` : ''}
              </span>
            </div>
          )}

          {/* Note + avis + durée */}
          <div className="service-card-stats">
            <div className="service-card-rating">
              <StarIcon className="w-3 h-3 text-yellow-500 fill-current" />
              <span>{displayRating.toFixed(1)}</span>
            </div>
            <span className="service-card-separator">•</span>
            <span className="service-card-reviews">
              {service.reviewCount} avis
            </span>
            <span className="service-card-separator">•</span>
            <div className="service-card-duration">
              <ClockIcon className="w-3 h-3" />
              <span>{service.duration} min</span>
            </div>
          </div>

          {/* Bouton de réservation */}
          <div className="service-card-footer">
            {onBook && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  onBook(service);
                }}
                className="service-card-book-btn"
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