'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Service } from '@/types';
import { favoritesApi } from '@/lib/api/users/favorites.api';
import { HeartIconFilled, MapPinIcon, ClockIcon, StarIcon, SearchIcon } from '@/components/ui/Icons';
import { CATEGORIES_MAP } from '@/lib/api/constants/categories.';

function getCategoryIcon(label: string) {
  const cat = CATEGORIES_MAP.get(label);
  if (!cat) return null;
  return cat.icon;
}

export default function ClientFavoritesPage() {
  const [favorites, setFavorites] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState<Set<string>>(new Set());

  useEffect(() => {
    favoritesApi.getFavorites()
      .then(data => setFavorites(Array.isArray(data) ? data : []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleRemove = useCallback(async (e: React.MouseEvent, serviceId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setRemoving(prev => new Set(prev).add(serviceId));
    try {
      await favoritesApi.remove(serviceId);
      setFavorites(prev => prev.filter(s => s._id !== serviceId));
    } catch (error) {
      console.error('Erreur suppression favori:', error);
    } finally {
      setRemoving(prev => { const next = new Set(prev); next.delete(serviceId); return next; });
    }
  }, []);

  if (loading) {
    return (
      <div className="provider-loading">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="provider-page">
      <div className="provider-container">

        {/* ── Header ── */}
        <div className="fav-page-header">
          <div>
            <h1 className="fav-page-title gradient-text">Mes Favoris</h1>
            <p className="fav-page-subtitle text-muted">
              {favorites.length > 0
                ? `${favorites.length} service${favorites.length > 1 ? 's' : ''} sauvegardé${favorites.length > 1 ? 's' : ''}`
                : 'Vos services préférés apparaissent ici'}
            </p>
          </div>
          {favorites.length > 0 && (
            <Link href="/search" className="btn btn-primary btn-sm">
              <SearchIcon className="w-4 h-4" />
              Découvrir
            </Link>
          )}
        </div>

        {/* ── Empty state ── */}
        {favorites.length === 0 ? (
          <div className="fav-empty-state card animate-fadeInUp">
            <div className="fav-empty-icon-wrap">
              <HeartIconFilled className="w-10 h-10" filled={false} />
            </div>
            <h3 className="fav-empty-title">Aucun favori pour l'instant</h3>
            <p className="fav-empty-text text-muted">
              Explorez les services et cliquez sur ♥ pour les sauvegarder ici.
            </p>
            <Link href="/search" className="btn btn-primary">
              <SearchIcon className="w-4 h-4" />
              Découvrir des services
            </Link>
          </div>
        ) : (
          /* ── Grid ── */
          <div className="fav-grid stagger-children">
            {favorites.map(service => {
              const price = service.basePrice ?? service.price ?? 0;
              const discount = service.discountPrice;
              const rating = service.avgRating ?? service.rating ?? 0;
              const isRemoving = removing.has(service._id);
              const categoryIcon = getCategoryIcon(service.category);

              return (
                <Link
                  key={service._id}
                  href={`/service/${service._id}`}
                  className={`fav-card card animate-fadeInUp ${isRemoving ? 'fav-card-removing' : ''}`}
                >
                  {/* Image */}
                  <div className="fav-card-img-wrap">
                    {service.images?.[0] ? (
                      <Image
                        src={service.images[0]}
                        alt={service.name}
                        fill
                        className="fav-card-img"
                      />
                    ) : (
                      <div className="fav-card-img-placeholder bg-primary-soft">
                        {categoryIcon
                          ? <span className="text-primary">{categoryIcon}</span>
                          : <MapPinIcon className="w-10 h-10 text-primary" />}
                      </div>
                    )}

                    {/* Heart button */}
                    <button
                      onClick={(e) => handleRemove(e, service._id)}
                      disabled={isRemoving}
                      className="fav-heart-btn"
                      aria-label="Retirer des favoris"
                    >
                      {isRemoving
                        ? <div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
                        : <HeartIconFilled className="w-4 h-4" filled={true} />
                      }
                    </button>

                    {discount && price > 0 && (
                      <span className="badge badge-error fav-discount-badge">
                        -{Math.round((1 - discount / price) * 100)}%
                      </span>
                    )}
                  </div>

                  {/* Body */}
                  <div className="fav-card-body">
                    <span className="badge badge-primary fav-category-badge">
                      {service.category}
                    </span>
                    <h3 className="fav-card-name truncate-2">{service.name}</h3>

                    {service.location?.city && (
                      <p className="fav-card-location text-subtle">
                        <MapPinIcon className="w-3 h-3" />
                        {service.location.city}
                        {service.location.governorate ? `, ${service.location.governorate}` : ''}
                      </p>
                    )}

                    <div className="fav-card-meta text-muted">
                      {rating > 0 && (
                        <span className="fav-card-rating">
                          <StarIcon className="w-3 h-3 text-warning" />
                          {rating.toFixed(1)}
                        </span>
                      )}
                      {service.reviewCount > 0 && (
                        <span>({service.reviewCount} avis)</span>
                      )}
                      {service.duration && (
                        <>
                          <span>·</span>
                          <span className="fav-card-duration">
                            <ClockIcon className="w-3 h-3" />
                            {service.duration} min
                          </span>
                        </>
                      )}
                    </div>

                    <div className="fav-card-footer">
                      <div className="fav-card-price-block">
                        {discount ? (
                          <>
                            <span className="fav-card-price text-primary">{discount} DT</span>
                            <span className="fav-card-price-old text-subtle">{price} DT</span>
                          </>
                        ) : (
                          <span className="fav-card-price text-primary">{price} DT</span>
                        )}
                      </div>
                      <span className="fav-card-book text-primary">Réserver →</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}