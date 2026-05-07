// frontend/lib/api/admin.api.ts
import { apiClient } from '../config';

export interface AdminStats {
  users: {
    total: number;
    clients: number;
    providers: number;
    admins: number;
    newThisPeriod: number;
    activeLast30Days: number;
    growthRate: number;
  };
  services: {
    total: number;
    pending: number;
    active: number;
    rejected: number;
  };
  reservations: {
    total: number;
    completed: number;
    cancelled: number;
    pending: number;
  };
  reviews: {
    total: number;
    averageRating: number;
  };
  charts: {
    usersByMonth: { month: string; clients: number; providers: number; total: number }[];
    servicesByMonth: { month: string; count: number }[];
    reservationsByMonth: { month: string; count: number }[];
    reservationsByDayOfWeek: { day: string; count: number; percentage: number }[];
    reservationsByHour: { hour: number; count: number }[];
    categoriesDistribution: { category: string; count: number; percentage: number; color: string }[];
    topCategories: { category: string; bookings: number }[];
    governorateStats: { governorate: string; clients: number; providers: number; services: number; bookings: number; percentage: number }[];
  };
  engagement: {
    clientRetention: number;
    providerActivity: number;
    conversionRate: number;
    satisfactionScore: number;
    repeatCustomers: number;
  };
  trending: {
    topProviders: { id: string; name: string; bookings: number; rating: number }[];
    topServices: { id: string; name: string; category: string; bookings: number }[];
  };
}

export const adminApi = {
  getStats: async (timeRange: 'week' | 'month' | 'year' = 'month'): Promise<AdminStats> => {
    const response = await apiClient.get('/admin/stats', { params: { timeRange } });
    return response.data;
  },
};