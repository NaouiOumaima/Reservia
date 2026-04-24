// features/admin/hooks/useAdminReviews.ts

import { useState, useEffect, useCallback } from 'react';
import { reviewsApi } from '@/lib/api/client';
import { Review } from '@/types';

interface UseAdminReviewsReturn {
  reportedReviews: Review[];
  loading: boolean;
  error: string | null;
  fetchReportedReviews: () => Promise<void>;
  deleteReview: (reviewId: string) => Promise<void>;
  dismissReport: (reviewId: string) => Promise<void>;
  reportedCount: number;
}

export function useAdminReviews(): UseAdminReviewsReturn {
  const [reportedReviews, setReportedReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reportedCount, setReportedCount] = useState(0);

  const fetchReportedReviews = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await reviewsApi.getReported();
      setReportedReviews(response.data || response);
      
      const countResponse = await reviewsApi.getReportedCount();
      setReportedCount(countResponse.data?.count || 0);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors du chargement des avis');
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteReview = useCallback(async (reviewId: string) => {
    setLoading(true);
    setError(null);
    try {
      await reviewsApi.deleteReview(reviewId);
      setReportedReviews(prev => prev.filter(r => r._id !== reviewId));
      setReportedCount(prev => prev - 1);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la suppression');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const dismissReport = useCallback(async (reviewId: string) => {
    setLoading(true);
    setError(null);
    try {
      await reviewsApi.dismissReport(reviewId);
      setReportedReviews(prev => prev.filter(r => r._id !== reviewId));
      setReportedCount(prev => prev - 1);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de l\'ignorement');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReportedReviews();
  }, [fetchReportedReviews]);

  return { reportedReviews, loading, error, fetchReportedReviews, deleteReview, dismissReport, reportedCount };
}