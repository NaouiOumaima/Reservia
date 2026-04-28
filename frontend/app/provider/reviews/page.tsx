'use client';

import { useEffect, useState } from 'react';
import { Review } from '@/types';
import { StarIcon } from '@/components/ui/Icons';

export default function ProviderReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    averageRating: 0,
    totalReviews: 0,
    fiveStars: 0,
    fourStars: 0,
    threeStars: 0,
    twoStars: 0,
    oneStar: 0,
  });

  useEffect(() => {
    // Simuler le chargement – remplacer par appel API réel
    setLoading(false);
  }, []);

  return (
    <div className="min-h-screen bg-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground">Avis & notes</h1>
          <p className="text-muted mt-1">Consulter et répondre aux avis clients</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card p-6 text-center">
            <StarIcon className="w-8 h-8 text-warning mx-auto mb-2" />
            <p className="text-4xl font-bold text-foreground">{stats.averageRating.toFixed(1)}</p>
            <p className="text-sm text-muted">Note moyenne</p>
          </div>
          <div className="card p-6 text-center">
            <p className="text-2xl font-bold text-foreground">{stats.totalReviews}</p>
            <p className="text-sm text-muted">Total avis</p>
          </div>
          <div className="card p-6 text-center">
            <p className="text-2xl font-bold text-success">{stats.fiveStars + stats.fourStars}</p>
            <p className="text-sm text-muted">Positifs (4-5★)</p>
          </div>
          <div className="card p-6 text-center">
            <p className="text-2xl font-bold text-error">{stats.oneStar + stats.twoStars}</p>
            <p className="text-sm text-muted">Négatifs (1-2★)</p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
          </div>
        ) : reviews.length === 0 ? (
          <div className="card p-12 text-center">
            <StarIcon className="w-16 h-16 text-muted mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">Aucun avis</h3>
            <p className="text-muted">Vous n'avez pas encore reçu d'avis clients</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review._id} className="card p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="flex text-warning">
                        {'★'.repeat(review.rating)}
                        {'☆'.repeat(5 - review.rating)}
                      </div>
                      {review.isReported && (
                        <span className="badge badge-error">Signalé</span>
                      )}
                    </div>
                    <p className="text-foreground mb-2">{review.comment}</p>
                    <p className="text-sm text-muted">
                      Par {review.userName} •{' '}
                      {new Date(review.createdAt).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                </div>

                <div className="mt-4 pl-4 border-l-4 border-border">
                  <p className="text-sm text-muted mb-2">Votre réponse :</p>
                  <textarea
                    className="input text-sm"
                    rows={2}
                    placeholder="Répondre à cet avis..."
                  />
                  <button className="mt-2 btn btn-primary text-sm">
                    Envoyer la réponse
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}