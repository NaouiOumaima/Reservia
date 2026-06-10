// components/service/ServiceDetailsModal.tsx
'use client';

import Image from 'next/image';
import {
  XMarkIcon as XIcon,
  StarIcon,
  MapPinIcon,
  ClockIcon,
  ArrowRightIcon,
  CheckCircleIcon,
} from '@/components/ui/Icons';
import type { Service } from '@/lib/api/services/types';
import { CATEGORIES_MAP } from '@/lib/api/constants/categories.';

interface ServiceDetailsModalProps {
  service: Service | null;
  onClose: () => void;
  onBook?: (service: Service) => void;
}

export default function ServiceDetailsModal({
  service,
  onClose,
  onBook,
}: ServiceDetailsModalProps) {
  if (!service) return null;

  const categoryInfo = CATEGORIES_MAP.get(service.category);

  return (
    /* Overlay */
    <div
      className="sp-modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-label={service.name}
      onClick={onClose}
    >
      {/* Box */}
      <div className="sp-modal-box" onClick={(e) => e.stopPropagation()}>

        {/* ── Image ── */}
        <div className="sp-modal-img-wrap">
          {service.images?.[0] ? (
            <Image
              src={service.images[0]}
              alt={service.name}
              fill
              sizes="(max-width: 640px) 100vw, 32rem"
              style={{ objectFit: 'cover' }}
            />
          ) : (
            <div className="sp-modal-img-placeholder">
              <span style={{ fontSize: '4rem' }}>{categoryInfo?.icon ?? '📍'}</span>
            </div>
          )}
          <div className="sp-modal-img-gradient" />

          {/* Catégorie badge */}
          <span className="sp-modal-img-cat">
            {categoryInfo?.frenchLabel ?? service.category}
          </span>

          {/* Fermer */}
          <button className="sp-modal-close" onClick={onClose} aria-label="Fermer">
            <XIcon className="w-4 h-4" />
          </button>
        </div>

        {/* ── Corps ── */}
        <div className="sp-modal-body">
          {/* Titre + statut */}
          <div className="sp-modal-title-row">
            <h2 className="sp-modal-title">{service.name}</h2>
            {service.isActive && (
              <span className="sp-modal-active-badge">
                <CheckCircleIcon className="w-3.5 h-3.5" />
                Actif
              </span>
            )}
          </div>

          {/* Méta */}
          <div className="sp-modal-meta">
            <span className="sp-modal-meta-item">
    <StarIcon className="w-4 h-4 fill-yellow-500 text-yellow-500" />
              <strong style={{ color: 'rgb(var(--foreground))' }}>
                {service.avgRating?.toFixed(1) ?? '—'}
              </strong>
              <span>({service.reviewCount ?? 0} avis)</span>
            </span>

            <span className="sp-modal-meta-sep">·</span>

            <span className="sp-modal-meta-item">
              <ClockIcon className="w-4 h-4" />
              {service.duration} min
            </span>

            {(service.location?.city || service.location?.governorate) && (
              <>
                <span className="sp-modal-meta-sep">·</span>
                <span className="sp-modal-meta-item">
                  <MapPinIcon className="w-4 h-4" />
                  {service.location.city}
                  {service.location.city && service.location.governorate ? ', ' : ''}
                  {service.location.governorate}
                </span>
              </>
            )}
          </div>

          {/* Description */}
          <p className="sp-modal-desc">
            {service.description || 'Aucune description disponible.'}
          </p>

          {/* Actions */}
          <div className="sp-modal-actions">
            <button
              className="sp-modal-btn-primary"
              onClick={() => onBook?.(service)}
            >
              Voir les détails
              <ArrowRightIcon className="w-4 h-4" />
            </button>
            <button className="sp-modal-btn-secondary" onClick={onClose}>
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}