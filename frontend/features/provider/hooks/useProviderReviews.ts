// features/provider/hooks/useProviderReviews.ts

import { useState, useEffect, useCallback } from 'react';
import { reviewsApi } from '@/lib/api/client';
import { Review } from '@/types';

interface UseProviderReviewsReturn {
  reviews: Review[];
  stats: {
    averageRating: number;
    totalReviews: number;
    fiveStars: number;
    fourStars: number;
    threeStars: number;
    twoStars: number;
    oneStar: number;
  };
  loading: boolean;
  error: string | null;
  fetchReviews: () => Promise<void>;
  respondToReview: (reviewId: string, response: string) => Promise<void>;
}

export function useProviderReviews(): UseProviderReviewsReturn {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    averageRating: 0,
    totalReviews: 0,
    fiveStars: 0,
    fourStars: 0,
    threeStars: 0,
    twoStars: 0,
    oneStar: 0,
  });

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // In real app, get reviews for provider's services
      const response = await reviewsApi.getByServiceId('');
      const data = response.data || response;
      setReviews(data);
      
      // Calculate stats
      if (data.length > 0) {
        const totalRating = data.reduce((sum: number, r: Review) => sum + r.rating, 0);
        const avg = totalRating / data.length;
        setStats({
          averageRating: avg,
          totalReviews: data.length,
          fiveStars: data.filter((r: Review) => r.rating === 5).length,
          fourStars: data.filter((r: Review) => r.rating === 4).length,
          threeStars: data.filter((r: Review) => r.rating === 3).length,
          twoStars: data.filter((r: Review) => r.rating === 2).length,
          oneStar: data.filter((r: Review) => r.rating === 1).length,
        });
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors du chargement des avis');
    } finally {
      setLoading(false);
    }
  }, []);

  const respondToReview = useCallback(async (reviewId: string, response: string) => {
    setLoading(true);
    setError(null);
    try {
      // In real app, call API to save response
      // await reviewsApi.respond(reviewId, response);
      setReviews(prev => prev.map(r => 
        r._id === reviewId ? { ...r, providerResponse: response } : r
      ));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de l\'envoi de la réponse');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  return { reviews, stats, loading, error, fetchReviews, respondToReview };
}