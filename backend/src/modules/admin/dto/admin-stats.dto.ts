// backend/src/modules/admin/dto/admin-stats.dto.ts
export class AdminStatsResponse {
  users: {
    total: number;
    clients: number;
    providers: number;
    newThisMonth: number;
    growthRate: number;
    activeLast30Days: number;
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
    completedRate: number;
  };
  reviews: {
    total: number;
    averageRating: number;
  };
  charts: {
    usersByMonth: { month: string; clients: number; providers: number }[];
    reservationsByMonth: { month: string; count: number }[];
    servicesByMonth: { month: string; count: number }[];
    categoriesByUsage: { category: string; count: number; percentage: number }[];
    topCategories: { category: string; bookings: number }[];
    reservationsByStatus: { status: string; count: number; color: string }[];
  };
  geolocation: {
    byGovernorate: {
      governorate: string;
      clients: number;
      providers: number;
      services: number;
      bookings: number;
      percentage: number;
    }[];
  };
  trending: {
    topProviders: { id: string; name: string; bookings: number; rating: number }[];
    topServices: { id: string; name: string; category: string; bookings: number }[];
  };
  engagement: {
    clientRetentionRate: number;
    providerActivityRate: number;
    avgResponseTime: number;
    satisfactionScore: number;
  };
}