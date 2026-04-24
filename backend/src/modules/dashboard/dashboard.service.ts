// src/modules/dashboard/dashboard.service.ts

import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Reservation, ReservationDocument } from '../../database/schemas/reservation.schema';
import { Service, ServiceDocument } from '../../database/schemas/service.schema';
import { Review, ReviewDocument } from '../../database/schemas/review.schema';

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

@Injectable()
export class DashboardService {
  private readonly logger = new Logger(DashboardService.name);

  constructor(
    @InjectModel(Reservation.name) private reservationModel: Model<ReservationDocument>,
    @InjectModel(Service.name) private serviceModel: Model<ServiceDocument>,
    @InjectModel(Review.name) private reviewModel: Model<ReviewDocument>,
  ) {}

  async getProviderDashboard(providerId: string, period: 'day' | 'week' | 'month' = 'month'): Promise<{ summary: DashboardSummary; period: string }> {
    const services = await this.serviceModel.find({ providerId: new Types.ObjectId(providerId) });
    const serviceIds = services.map(s => s._id);
    const dateFilter = this.getDateFilter(period);

    const query: any = { serviceId: { $in: serviceIds } };
    if (dateFilter) query.createdAt = { $gte: dateFilter };

    const [reservations, reviews] = await Promise.all([
      this.reservationModel.find(query),
      this.reviewModel.find({ serviceId: { $in: serviceIds }, createdAt: { $gte: dateFilter || new Date(0) } }),
    ]);

    const completedReservations = reservations.filter(r => r.status === 'completed').length;
    const cancelledReservations = reservations.filter(r => r.status === 'cancelled').length;
    const pendingReservations = reservations.filter(r => r.status === 'pending').length;
    const confirmedReservations = reservations.filter(r => r.status === 'confirmed').length;

    const totalRevenue = reservations
      .filter(r => r.status === 'completed' || r.status === 'confirmed')
      .reduce((sum, r) => sum + r.price, 0);

    const avgRating = reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

    const cancellationRate = reservations.length > 0 ? (cancelledReservations / reservations.length) * 100 : 0;
    const completionRate = reservations.length > 0 ? (completedReservations / reservations.length) * 100 : 0;

    return {
      summary: {
        totalReservations: reservations.length,
        completedReservations,
        cancelledReservations,
        pendingReservations,
        confirmedReservations,
        totalRevenue,
        avgRating: Math.round(avgRating * 10) / 10,
        reviewCount: reviews.length,
        cancellationRate: Math.round(cancellationRate * 10) / 10,
        completionRate: Math.round(completionRate * 10) / 10,
        servicesCount: services.length,
      },
      period,
    };
  }

  async getServiceStats(providerId: string): Promise<ServiceStats[]> {
    const services = await this.serviceModel.find({ providerId: new Types.ObjectId(providerId) });
    const stats: ServiceStats[] = [];

    for (const service of services) {
      const reservations = await this.reservationModel.find({ serviceId: service._id });
      const reviews = await this.reviewModel.find({ serviceId: service._id });

      const completed = reservations.filter(r => r.status === 'completed').length;
      const cancelled = reservations.filter(r => r.status === 'cancelled').length;
      const total = reservations.length;

      const avgRating = reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 0;

      stats.push({
        serviceId: service._id.toString(),
        serviceName: service.name,
        totalReservations: total,
        completedReservations: completed,
        cancelledReservations: cancelled,
        cancellationRate: total > 0 ? Math.round((cancelled / total) * 1000) / 10 : 0,
        avgRating: Math.round(avgRating * 10) / 10,
        revenue: completed * (service.basePrice || 0),
      });
    }

    return stats.sort((a, b) => b.totalReservations - a.totalReservations);
  }

  async getHourlyHeatmap(providerId: string): Promise<HourlyHeatmapData[]> {
    const services = await this.serviceModel.find({ providerId: new Types.ObjectId(providerId) });
    const serviceIds = services.map(s => s._id);
    const reservations = await this.reservationModel.find({ serviceId: { $in: serviceIds } });

    const heatmap: HourlyHeatmapData[] = [];

    for (let day = 0; day < 7; day++) {
      for (let hour = 0; hour < 24; hour++) {
        const count = reservations.filter(r => {
          const date = new Date(r.startTime);
          return date.getDay() === day && date.getHours() === hour;
        }).length;
        heatmap.push({ hour, day, count });
      }
    }

    return heatmap;
  }

  async getTrends(providerId: string): Promise<TrendData[]> {
    const services = await this.serviceModel.find({ providerId: new Types.ObjectId(providerId) });
    const serviceIds = services.map(s => s._id);
    const reservations = await this.reservationModel.find({ serviceId: { $in: serviceIds } }).sort({ createdAt: 1 });

    const trendsMap = new Map<string, { reservations: number; revenue: number }>();

    for (const reservation of reservations) {
      // Remplacer la vérification de reservation.createdAt par:
if (!(reservation as any).createdAt) continue;
const dateKey = new Date((reservation as any).createdAt).toISOString().split('T')[0];

      if (!trendsMap.has(dateKey)) {
        trendsMap.set(dateKey, { reservations: 0, revenue: 0 });
      }

      const data = trendsMap.get(dateKey)!;
      data.reservations++;

      if (reservation.status === 'completed') {
        data.revenue += reservation.price;
      }
    }

    return Array.from(trendsMap.entries()).map(([date, data]) => ({
      date,
      reservations: data.reservations,
      revenue: data.revenue,
    }));
  }

  private getDateFilter(period: string): Date | null {
    const now = new Date();
    switch (period) {
      case 'day':
        return new Date(now.setDate(now.getDate() - 1));
      case 'week':
        return new Date(now.setDate(now.getDate() - 7));
      case 'month':
        return new Date(now.setMonth(now.getMonth() - 1));
      default:
        return null;
    }
  }
}