// frontend/components/RecentAppReviews.tsx
'use client';

import { useEffect, useState } from 'react';
import { reviewsApi } from '@/lib/api/reviews';
import { StarIcon } from '@/components/ui/Icons';
import { Review } from '@/lib/api/reviews/types';

export default function RecentAppReviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await reviewsApi.getAppReviews(1, 3);
        setReviews(response.reviews.filter(r => r.isApproved));
      } catch (error) {
        console.error('Erreur chargement avis:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, []);

  if (loading) return <div className="text-center py-8">Chargement des avis...</div>;
  if (reviews.length === 0) return null;

  return (
    <div>
      <h3 className="text-lg font-semibold text-[rgb(var(--foreground))] mb-4 text-center">
        Derniers avis
      </h3>
      <div className="space-y-4">
        {reviews.map((review) => (
          <div key={review._id} className="card p-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-full bg-[rgb(var(--primary))] flex items-center justify-center text-white text-sm font-semibold">
                    {review.userName?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <div>
                    <p className="font-medium text-[rgb(var(--foreground))]">{review.userName}</p>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <StarIcon
                          key={star}
                          className={`w-3 h-3 ${
                            star <= review.rating
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-400'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-[rgb(var(--foreground-muted))] text-sm mt-2">
                  {review.comment}
                </p>
                <p className="text-xs text-[rgb(var(--foreground-muted))] mt-2">
                  {new Date(review.createdAt).toLocaleDateString('fr-FR')}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}