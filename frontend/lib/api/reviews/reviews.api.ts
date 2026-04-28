// lib/api/reviews/reviews.api.ts
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
    const response = await apiClient.get(`/api/reviews/service/${serviceId}`);
    return response.data;
  },

  getMyReviews: async (): Promise<Review[]> => {
    const response = await apiClient.get('/api/reviews/my');
    return response.data;
  },

  getProviderReviews: async (): Promise<Review[]> => {
    const response = await apiClient.get('/api/reviews/provider');
    return response.data;
  },

  create: async (data: CreateReviewData): Promise<Review> => {
    const response = await apiClient.post('/api/reviews', data);
    return response.data;
  },

  respond: async (id: string, responseText: string): Promise<Review> => {
    const response = await apiClient.post(`/api/reviews/${id}/respond`, { response: responseText });
    return response.data;
  },

  report: async (id: string): Promise<void> => {
    await apiClient.post(`/api/reviews/${id}/report`);
  },
};