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

export interface HourlyHeatmapData {
  hour: number;
  day: number;
  count: number;
}

export interface TrendData {
  date: string;
  reservations: number;
  revenue: number;
}