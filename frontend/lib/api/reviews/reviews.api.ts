import { apiClient } from '../config';
import { Review } from '@/types';

export interface CreateReviewData {
  serviceId: string;
  rating: number;
  comment: string;
  images?: string[];
}

export const reviewsApi = {
  getByService: async (serviceId: string): Promise<Review[]> => {
    const response = await apiClient.get(`/reviews/service/${serviceId}`);
    return response.data;
  },

  getMyReviews: async (): Promise<Review[]> => {
    const response = await apiClient.get('/reviews/my');
    return response.data;
  },

  getProviderReviews: async (): Promise<Review[]> => {
    const response = await apiClient.get('/reviews/provider');
    return response.data;
  },

  create: async (data: CreateReviewData): Promise<Review> => {
    const response = await apiClient.post('/reviews', data);
    return response.data;
  },

  respond: async (id: string, responseText: string): Promise<Review> => {
    const response = await apiClient.post(`/reviews/${id}/respond`, { response: responseText });
    return response.data;
  },

  report: async (id: string): Promise<void> => {
    await apiClient.post(`/reviews/${id}/report`);
  },
};