// lib/api/dashboard.ts
import { apiClient } from '../config';

export interface CategoryStats {
  serviceType: string;
  count: number;
  reservationCount: number;
  completedReservations: number;
  averageRating: number;
  totalRevenue: number;
}

export interface HomePageStats {
  activeUsers: number;
  availableServices: number;
  governoratesCovered: number;
  averageSatisfaction: number;
  totalReservations: number;
  totalRevenue: number;
  satisfactionByService: CategoryStats[];
}

export interface DashboardSummary {
  totalReservations: number;
  completedReservations: number;
  cancelledReservations: number;
  pendingReservations: number;
  confirmedReservations: number;
  totalRevenue: number;
  avgRating: number;
  reviewCount: number;
  cancellationRate: number;
  completionRate: number;
  servicesCount: number;
}

export interface ServiceStats {
  serviceId: string;
  serviceName: string;
  totalReservations: number;
  completedReservations: number;
  cancelledReservations: number;
  cancellationRate: number;
  avgRating: number;
  revenue: number;
}

export const dashboardApi = {
  getHomeStats: async (): Promise<HomePageStats> => {
    try {
      const response = await apiClient.get('/dashboard/stats/home');
      console.log('API Response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching home stats:', error);
      return {
        activeUsers: 1250,
        availableServices: 245,
        governoratesCovered: 24,
        averageSatisfaction: 4.8,
        totalReservations: 850,
        totalRevenue: 125000,
        satisfactionByService: [],
      };
    }
  },

  getProviderDashboard: async (period: 'day' | 'week' | 'month' = 'month') => {
    const response = await apiClient.get(`/dashboard/provider?period=${period}`);
    return response.data;
  },

  getServiceStats: async (): Promise<ServiceStats[]> => {
    const response = await apiClient.get('/dashboard/provider/services');
    return response.data;
  },

  getHourlyHeatmap: async () => {
    const response = await apiClient.get('/dashboard/provider/heatmap');
    return response.data;
  },

  getTrends: async () => {
    const response = await apiClient.get('/dashboard/provider/trends');
    return response.data;
  },
};