export interface CategoryStats {
  serviceType: string;
  count: number;
  reservationCount: number;
  completedReservations: number;
  averageRating: number;
}

export interface HomePageStats {
  activeUsers: number;
  availableServices: number;
  governoratesCovered: number;
  averageSatisfaction: number;
  totalReservations: number;
  satisfactionByService: CategoryStats[];
}

export interface DashboardSummary {
  totalReservations: number;
  completedReservations: number;
  cancelledReservations: number;
  pendingReservations: number;
  confirmedReservations: number;
  avgRating: number;
  reviewCount: number;
  cancellationRate: number;
  completionRate: number;
  servicesCount: number;
  todayReservationsCount?: number;
}

export interface ClientDashboardSummary {
  upcomingReservations: any[];
  upcomingCount: number;
  pendingCount: number;
  confirmedCount: number;
  lastNotification: {
    _id: string;
    type: string;
    title: string;
    message: string;
    isRead: boolean;
    createdAt: string;
  } | null;
}

export interface ServiceStats {
  serviceId: string;
  serviceName: string;
  totalReservations: number;
  completedReservations: number;
  cancelledReservations: number;
  cancellationRate: number;
  avgRating: number;
}

export interface HourlyHeatmapData {
  hour: number;
  day: number;
  count: number;
}

export interface TrendData {
  date: string;
  reservations: number;
}
