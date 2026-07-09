'use client';

import { useCallback, useEffect, useState } from 'react';
import type { Review } from '@/lib/api/reviews/types';
import { reviewsApi, ProviderReviewStats } from '@/lib/api/reviews';
import { servicesApi } from '@/lib/api/services';
import { Service } from '@/lib/api/services/types';
import { StarIcon } from '@/components/ui/Icons';

export default function ProviderReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ProviderReviewStats | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [serviceFilter, setServiceFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  const loadReviews = useCallback(async (filter: string) => {
    try {
      const data = await reviewsApi.getProviderReviews(filter === 'all' ? undefined : filter);
      setReviews(data.reviews);
    } catch (error) {
      console.error('Erreur chargement avis reçus:', error);
    }
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [statsData, servicesData] = await Promise.all([
          reviewsApi.getProviderReviewStats(),
          servicesApi.getByProvider(),
        ]);
        setStats(statsData);
        setServices(servicesData);
        await loadReviews('all');
      } catch (error) {
        console.error('Erreur chargement avis reçus:', error);
      } finally {
        setLoading(false);
      }
    })();
  }, [loadReviews]);

  useEffect(() => {
    loadReviews(serviceFilter);
  }, [serviceFilter, loadReviews]);

  const renderStars = (rating: number) => (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <StarIcon key={n} className={`w-4 h-4 ${n <= rating ? 'text-warning' : 'text-muted'}`} />
      ))}
    </div>
  );

  return (
    <div className="bg-background min-h-screen py-8">
      <div className="container-app">
        <div className="mb-8">
          <h1 className="text-2xl font-bold gradient-text">Avis & notes</h1>
          <p className="text-muted mt-1">Consultez les avis laissés par vos clients, par service</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card text-center">
            <StarIcon className="w-8 h-8 text-warning mx-auto mb-2" />
            <p className="text-4xl font-bold text-foreground">{(stats?.globalAverage ?? 0).toFixed(1)}</p>
            <p className="text-sm text-muted">Note moyenne globale</p>
          </div>
          <div className="card text-center">
            <p className="text-2xl font-bold text-foreground">{stats?.totalReviews ?? 0}</p>
            <p className="text-sm text-muted">Total avis reçus</p>
          </div>
          <div className="card text-center">
            <p className="text-2xl font-bold text-foreground">{stats?.byService.length ?? 0}</p>
            <p className="text-sm text-muted">Services notés</p>
          </div>
        </div>

        {stats && stats.byService.length > 0 && (
          <div className="card mb-8">
            <h2 className="text-lg font-semibold text-foreground mb-4">Note moyenne par service</h2>
            <div className="space-y-3">
              {stats.byService.map((s) => (
                <div key={s.serviceId} className="flex items-center justify-between">
                  <span className="text-foreground">{s.serviceName}</span>
                  <div className="flex items-center gap-3">
                    {renderStars(Math.round(s.averageRating))}
                    <span className="text-sm text-muted">{s.averageRating.toFixed(1)} ({s.reviewCount})</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {services.length > 0 && (
          <select
            className="input mb-6"
            style={{ maxWidth: '16rem' }}
            value={serviceFilter}
            onChange={(e) => setServiceFilter(e.target.value)}
          >
            <option value="all">Tous les services</option>
            {services.map((s) => (
              <option key={s._id} value={s._id}>{s.name}</option>
            ))}
          </select>
        )}

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="spinner" />
          </div>
        ) : reviews.length === 0 ? (
          <div className="card text-center py-12">
            <StarIcon className="w-16 h-16 text-muted mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">Aucun avis</h3>
            <p className="text-muted">Vous n&apos;avez pas encore reçu d&apos;avis clients</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => {
              const serviceName =
                typeof review.serviceId === 'object' ? review.serviceId?.name : review.serviceName;
              return (
                <div key={review._id} className="card">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {renderStars(review.rating)}
                        <span className="text-sm text-muted">{serviceName}</span>
                      </div>
                      <p className="text-foreground mb-2">{review.comment}</p>
                      <p className="text-sm text-muted">
                        Par {review.userName} •{' '}
                        {new Date(review.createdAt).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
