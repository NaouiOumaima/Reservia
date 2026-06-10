// components/service/ServiceCard.tsx
'use client';

import Image from 'next/image';
import { useAuth } from '@/providers/AuthProvider';
import FavoriteButton from '@/components/FavoriteButton';
import { StarIcon, MapPinIcon, ClockIcon } from '@/components/ui/Icons';
import type { Service } from '@/types';
import { CATEGORIES_MAP } from '@/lib/api/constants/categories.';

interface ServiceCardProps {
  service: Service;
  onBook?: (service: Service) => void;
  showFavorite?: boolean;
  onClick?: (service: Service) => void;
}

export default function ServiceCard({
  service,
  onBook,
  showFavorite = false,
  onClick,
}: ServiceCardProps) {
  const { user } = useAuth();

  const categoryInfo = CATEGORIES_MAP.get(service.category);
  const categoryLabel = categoryInfo?.frenchLabel ?? service.category;

  const handleClick = () => onClick?.(service);

  return (
    <article
      className="sp-card"
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
      aria-label={`Voir le service : ${service.name}`}
    >
      {/* ── Image ── */}
      <div className="sp-card-img-wrap">
        {service.images?.[0] ? (
          <Image
            src={service.images[0]}
            alt={service.name}
            fill
            sizes="(max-width: 500px) 100vw, (max-width: 960px) 50vw, 33vw"
            className="sp-card-img"
          />
        ) : (
          <div className="sp-card-img-placeholder">
            <span>{categoryInfo?.icon ?? '📍'}</span>
          </div>
        )}

        {/* Badge gratuit */}
        <span className="sp-card-free-badge">Gratuit</span>

        {/* Favori */}
        {showFavorite && user?.role === 'client' && (
          <div className="sp-card-fav">
            <FavoriteButton
              serviceId={service._id}
              size="sm"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        )}
      </div>

      {/* ── Corps ── */}
      <div className="sp-card-body">
        {/* Catégorie */}
        <span className="sp-card-category-pill">{categoryLabel}</span>

        {/* Titre */}
        <h3 className="sp-card-title">{service.name}</h3>

        {/* Description */}
        <p className="sp-card-desc">{service.description}</p>

        {/* Localisation */}
        {(service.location?.city || service.location?.governorate) && (
          <div className="sp-card-location">
            <MapPinIcon className="w-3.5 h-3.5 flex-shrink-0" />
            <span>
              {service.location.city}
              {service.location.city && service.location.governorate ? ', ' : ''}
              {service.location.governorate}
            </span>
          </div>
        )}

        {/* Meta : note · durée */}
        <div className="sp-card-meta">
          <span className="sp-card-rating">
 <StarIcon className="w-3.5 h-3.5 fill-yellow-500 text-yellow-500" />
             {(service.avgRating ?? 0).toFixed(1)}
          </span>
          <span className="sp-card-sep">·</span>
          <span>{service.reviewCount ?? 0} avis</span>
          <span className="sp-card-sep">·</span>
          <span className="sp-card-duration">
            <ClockIcon className="w-3.5 h-3.5" />
            {service.duration} min
          </span>
        </div>

        {/* CTA (optionnel) */}
        {onBook && (
          <div className="sp-card-footer">
            <button
              className="sp-card-book-btn"
              onClick={(e) => {
                e.stopPropagation();
                onBook(service);
              }}
            >
              Réserver gratuitement
            </button>
          </div>
        )}
      </div>
    </article>
  );
}