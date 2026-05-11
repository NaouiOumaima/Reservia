import { apiClient } from '../config';
import { Review, PaginatedReviewsResponse } from './types';

export interface CreateReviewData {
  serviceId?: string;
  rating: number;
  comment: string;
  images?: string[];
  type?: 'service' | 'app';
}

export interface ReportReviewData {
  reason: 'spam' | 'offensive' | 'fake' | 'inappropriate' | 'other';
  details?: string;
}

export interface AppReviewStats {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: { rating: number; count: number }[];
}

export const reviewsApi = {
  // Récupérer les avis d'un service
  getByService: async (serviceId: string, page: number = 1, limit: number = 10): Promise<PaginatedReviewsResponse> => {
    const response = await apiClient.get(`/reviews/service/${serviceId}`, {
      params: { page, limit },
    });
    return response.data;
  },

  // Récupérer les avis sur l'application
  getAppReviews: async (page: number = 1, limit: number = 10): Promise<PaginatedReviewsResponse> => {
    const response = await apiClient.get('/reviews/app', {
      params: { page, limit },
    });
    return response.data;
  },

  // Récupérer les statistiques des avis app
  getAppReviewStats: async (): Promise<AppReviewStats> => {
    const response = await apiClient.get('/reviews/app/stats');
    return response.data;
  },

  // Récupérer mes avis
  getMyReviews: async (): Promise<Review[]> => {
    const response = await apiClient.get('/reviews/my');
    return response.data;
  },

  // Créer un avis (service ou app)
  create: async (data: CreateReviewData): Promise<Review> => {
    const response = await apiClient.post('/reviews', data);
    return response.data;
  },

  // Signaler un avis
  report: async (id: string, data: ReportReviewData): Promise<Review> => {
    const response = await apiClient.post(`/reviews/${id}/report`, data);
    return response.data;
  },

  // Marquer comme utile
  markHelpful: async (id: string): Promise<Review> => {
    const response = await apiClient.post(`/reviews/${id}/helpful`);
    return response.data;
  },

  // ADMIN: Récupérer les avis signalés
  getReportedReviews: async (): Promise<Review[]> => {
    const response = await apiClient.get('/reviews/admin/reported');
    return response.data;
  },

  // ADMIN: Compter les avis signalés
  getReportedCount: async (): Promise<number> => {
    const response = await apiClient.get('/reviews/admin/reported/count');
    return response.data.count;
  },

  // ADMIN: Approuver un avis
  approveReview: async (id: string): Promise<Review> => {
    const response = await apiClient.post(`/reviews/admin/${id}/approve`);
    return response.data;
  },

  // ADMIN: Supprimer un avis
  deleteReview: async (id: string): Promise<void> => {
    await apiClient.delete(`/reviews/admin/${id}`);
  },
  // ADMIN: Récupérer TOUS les avis
getAllReviewsForAdmin: async (
  page: number = 1,
  limit: number = 10,
  status: 'all' | 'reported' | 'approved' | 'pending' = 'all'
): Promise<{ reviews: Review[]; total: number; stats: any }> => {
  const response = await apiClient.get('/reviews/admin/all', {
    params: { page, limit, status },
  });
  return response.data;
},
};