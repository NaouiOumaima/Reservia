// lib/api/dashboard.ts
import { apiClient } from '../config';
import {
  HomePageStats,
  DashboardSummary,
  ClientDashboardSummary,
  ServiceStats,
} from './types';

export const dashboardApi = {
  getHomeStats: async (): Promise<HomePageStats> => {
    const response = await apiClient.get('/dashboard/stats/home');
    return response.data;
  },

  getClientDashboard: async (): Promise<ClientDashboardSummary> => {
    const response = await apiClient.get('/dashboard/client');
    return response.data;
  },

  getProviderDashboard: async (
    period: 'day' | 'week' | 'month' = 'month',
  ): Promise<{ summary: DashboardSummary; period: string }> => {
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
