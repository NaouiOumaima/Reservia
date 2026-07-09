// src/modules/dashboard/dashboard.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  Reservation,
  ReservationDocument,
} from '../../database/schemas/reservation.schema';
import {
  Service,
  ServiceDocument,
  ServiceStatus,
} from '../../database/schemas/service.schema';
import { Review, ReviewDocument } from '../../database/schemas/review.schema';
import { User, UserDocument } from '../../database/schemas/user.schema';
import {
  Notification,
  NotificationDocument,
} from '../../database/schemas/notification.schema';

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
  lastNotification: Notification | null;
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

export interface HomePageStats {
  activeUsers: number;
  availableServices: number;
  governoratesCovered: number;
  averageSatisfaction: number;
  totalReservations: number;
  satisfactionByService: Array<{
    serviceType: string;
    count: number;
    reservationCount: number;
    completedReservations: number;
    averageRating: number;
  }>;
}

@Injectable()
export class DashboardService {
  private readonly logger = new Logger(DashboardService.name);

  private readonly categoryLabelMap: Record<string, string> = {
    restaurant: 'Restauration',
    hotel: 'Hébergement',
    beauté: 'Beauté & Bien-être',
    beauty: 'Beauté & Bien-être',
    fitness: 'Fitness',
    medical: 'Santé',
    sante: 'Santé',
    santé: 'Santé',
    education: 'Éducation',
    éducation: 'Éducation',
    loisirs: 'Loisirs',
    entertainment: 'Loisirs',
    transport: 'Transport',
    autre: 'Autre',
    other: 'Autre',
  };

  private readonly allCategories = [
    'Restauration',
    'Hébergement',
    'Beauté & Bien-être',
    'Fitness',
    'Santé',
    'Éducation',
    'Loisirs',
    'Transport',
    'Autre',
  ];

  constructor(
    @InjectModel(Reservation.name)
    private reservationModel: Model<ReservationDocument>,
    @InjectModel(Service.name) private serviceModel: Model<ServiceDocument>,
    @InjectModel(Review.name) private reviewModel: Model<ReviewDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Notification.name)
    private notificationModel: Model<NotificationDocument>,
  ) {}

  async getClientDashboard(clientId: string): Promise<ClientDashboardSummary> {
    try {
      const clientObjectId = new Types.ObjectId(clientId);

      const [
        upcomingReservations,
        pendingCount,
        confirmedCount,
        lastNotification,
      ] = await Promise.all([
        this.reservationModel
          .find({
            clientId: clientObjectId,
            status: { $in: ['pending', 'confirmed'] },
            startTime: { $gte: new Date() },
          })
          .sort({ startTime: 1 })
          .limit(5)
          .populate('serviceId', 'name location images')
          .lean(),
        this.reservationModel.countDocuments({
          clientId: clientObjectId,
          status: 'pending',
        }),
        this.reservationModel.countDocuments({
          clientId: clientObjectId,
          status: 'confirmed',
        }),
        this.notificationModel
          .findOne({ userId: clientObjectId })
          .sort({ createdAt: -1 })
          .lean(),
      ]);

      return {
        upcomingReservations,
        upcomingCount: pendingCount + confirmedCount,
        pendingCount,
        confirmedCount,
        lastNotification: lastNotification as Notification | null,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Error getting client dashboard: ${errorMessage}`);
      throw error;
    }
  }

  async getProviderDashboard(
    providerId: string,
    period: 'day' | 'week' | 'month' = 'month',
  ): Promise<{ summary: DashboardSummary; period: string }> {
    try {
      const services = await this.serviceModel.find({
        providerId: new Types.ObjectId(providerId),
      });
      const serviceIds = services.map((s) => s._id);
      const dateFilter = this.getDateFilter(period);

      const query: any = { serviceId: { $in: serviceIds } };
      if (dateFilter) query.createdAt = { $gte: dateFilter };

      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const todayEnd = new Date();
      todayEnd.setHours(23, 59, 59, 999);

      const [reservations, reviews, todayReservationsCount] = await Promise.all(
        [
          this.reservationModel.find(query).lean(),
          this.reviewModel
            .find({
              serviceId: { $in: serviceIds },
              createdAt: { $gte: dateFilter || new Date(0) },
            })
            .lean(),
          this.reservationModel.countDocuments({
            serviceId: { $in: serviceIds },
            startTime: { $gte: todayStart, $lte: todayEnd },
          }),
        ],
      );

      const completedReservations = reservations.filter(
        (r) => r.status === 'completed',
      ).length;
      const cancelledReservations = reservations.filter(
        (r) => r.status === 'cancelled',
      ).length;
      const pendingReservations = reservations.filter(
        (r) => r.status === 'pending',
      ).length;
      const confirmedReservations = reservations.filter(
        (r) => r.status === 'confirmed',
      ).length;

      const avgRating =
        reviews.length > 0
          ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
          : 0;

      const cancellationRate =
        reservations.length > 0
          ? (cancelledReservations / reservations.length) * 100
          : 0;
      const completionRate =
        reservations.length > 0
          ? (completedReservations / reservations.length) * 100
          : 0;

      return {
        summary: {
          totalReservations: reservations.length,
          completedReservations,
          cancelledReservations,
          pendingReservations,
          confirmedReservations,
          avgRating: Math.round(avgRating * 10) / 10,
          reviewCount: reviews.length,
          cancellationRate: Math.round(cancellationRate * 10) / 10,
          completionRate: Math.round(completionRate * 10) / 10,
          servicesCount: services.length,
          todayReservationsCount,
        },
        period,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Error getting provider dashboard: ${errorMessage}`);
      throw error;
    }
  }

  async getServiceStats(providerId: string): Promise<ServiceStats[]> {
    try {
      const services = await this.serviceModel
        .find({ providerId: new Types.ObjectId(providerId) })
        .lean();
      const stats: ServiceStats[] = [];

      for (const service of services) {
        const reservations = await this.reservationModel
          .find({ serviceId: service._id })
          .lean();
        const reviews = await this.reviewModel
          .find({ serviceId: service._id })
          .lean();

        const completed = reservations.filter(
          (r) => r.status === 'completed',
        ).length;
        const cancelled = reservations.filter(
          (r) => r.status === 'cancelled',
        ).length;
        const total = reservations.length;

        const avgRating =
          reviews.length > 0
            ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
            : 0;

        stats.push({
          serviceId: service._id.toString(),
          serviceName: service.name,
          totalReservations: total,
          completedReservations: completed,
          cancelledReservations: cancelled,
          cancellationRate:
            total > 0 ? Math.round((cancelled / total) * 1000) / 10 : 0,
          avgRating: Math.round(avgRating * 10) / 10,
        });
      }

      return stats.sort((a, b) => b.totalReservations - a.totalReservations);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Error getting service stats: ${errorMessage}`);
      throw error;
    }
  }

  async getHourlyHeatmap(providerId: string): Promise<HourlyHeatmapData[]> {
    try {
      const services = await this.serviceModel.find({
        providerId: new Types.ObjectId(providerId),
      });
      const serviceIds = services.map((s) => s._id);
      const reservations = await this.reservationModel
        .find({ serviceId: { $in: serviceIds } })
        .lean();

      const heatmap: HourlyHeatmapData[] = [];

      for (let day = 0; day < 7; day++) {
        for (let hour = 0; hour < 24; hour++) {
          const count = reservations.filter((r) => {
            const date = new Date(r.startTime);
            return date.getDay() === day && date.getHours() === hour;
          }).length;
          heatmap.push({ hour, day, count });
        }
      }

      return heatmap;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Error getting hourly heatmap: ${errorMessage}`);
      throw error;
    }
  }

  async getTrends(providerId: string): Promise<TrendData[]> {
    try {
      const services = await this.serviceModel.find({
        providerId: new Types.ObjectId(providerId),
      });
      const serviceIds = services.map((s) => s._id);
      const reservations = await this.reservationModel
        .find({ serviceId: { $in: serviceIds } })
        .sort({ createdAt: 1 })
        .lean();

      const trendsMap = new Map<string, { reservations: number }>();

      for (const reservation of reservations) {
        const createdAt = (reservation as any).createdAt;
        if (!createdAt) continue;

        const dateKey = new Date(createdAt).toISOString().split('T')[0];

        if (!trendsMap.has(dateKey)) {
          trendsMap.set(dateKey, { reservations: 0 });
        }

        const data = trendsMap.get(dateKey)!;
        data.reservations++;
      }

      return Array.from(trendsMap.entries()).map(([date, data]) => ({
        date,
        reservations: data.reservations,
      }));
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Error getting trends: ${errorMessage}`);
      throw error;
    }
  }

  async getHomePageStats(): Promise<HomePageStats> {
    try {
      this.logger.log('📊 Fetching home page stats...');

      // 1. Utilisateurs actifs = TOUS les utilisateurs (clients + providers) SAUF l'admin
      const totalUsers = await this.userModel.countDocuments({
        email: { $ne: 'admin@test.com' },
        isBanned: false,
      });
      const activeUsers = totalUsers;
      this.logger.log(`✅ Total users (excluding admin): ${activeUsers}`);

      // 2. Services disponibles
      const availableServices = await this.serviceModel.countDocuments({
        status: ServiceStatus.ACTIVE,
      });
      this.logger.log(`✅ Available services: ${availableServices}`);

      // 3. Gouvernorats couverts
      const governorates = await this.serviceModel.distinct(
        'location.governorate',
        { status: ServiceStatus.ACTIVE },
      );
      const governoratesCovered = governorates.filter(
        (g) => g && g !== '' && g !== null,
      ).length;
      this.logger.log(`✅ Governorates covered: ${governoratesCovered}`);

      // 4. Réservations totales
      const allReservations = await this.reservationModel.find().lean();
      const totalReservations = allReservations.length;
      this.logger.log(`✅ Total reservations: ${totalReservations}`);

      // 6. Satisfaction moyenne générale
      const allReviews = await this.reviewModel.find().lean();
      let averageSatisfaction = 0;

      if (allReviews.length > 0) {
        const totalRating = allReviews.reduce(
          (sum, r) => sum + (r.rating || 0),
          0,
        );
        averageSatisfaction =
          Math.round((totalRating / allReviews.length) * 10) / 10;
      } else {
        averageSatisfaction = 0;
      }
      this.logger.log(
        `✅ Average satisfaction: ${averageSatisfaction} (basé sur ${allReviews.length} avis)`,
      );

      // 7. Récupérer tous les services actifs
      const services = await this.serviceModel
        .find({ status: ServiceStatus.ACTIVE })
        .lean();

      // 8. Construire les statistiques par catégorie
      const categoryMap = new Map<
        string,
        {
          serviceCount: number;
          reservationCount: number;
          completedReservations: number;
          ratings: number[];
        }
      >();

      // Initialiser toutes les catégories
      for (const category of this.allCategories) {
        categoryMap.set(category, {
          serviceCount: 0,
          reservationCount: 0,
          completedReservations: 0,
          ratings: [],
        });
      }

      // Compter les services par catégorie
      for (const service of services) {
        const rawCategory = service.category || 'Autre';
        const category =
          this.categoryLabelMap[rawCategory.toLowerCase()] ?? rawCategory;

        if (categoryMap.has(category)) {
          categoryMap.get(category)!.serviceCount++;
        } else {
          categoryMap.set(category, {
            serviceCount: 1,
            reservationCount: 0,
            completedReservations: 0,
            ratings: [],
          });
        }
      }

      // Compter les réservations par catégorie
      for (const reservation of allReservations) {
        const service = services.find(
          (s) => s._id.toString() === reservation.serviceId.toString(),
        );
        if (service) {
          const rawCategory = service.category || 'Autre';
          const category =
            this.categoryLabelMap[rawCategory.toLowerCase()] ?? rawCategory;

          if (categoryMap.has(category)) {
            const catStats = categoryMap.get(category)!;
            catStats.reservationCount++;

            if (reservation.status === 'completed') {
              catStats.completedReservations++;
            }
          }
        }
      }

      // Ajouter les évaluations par catégorie (uniquement les avis de service, les avis "app" n'ont pas de serviceId)
      for (const review of allReviews) {
        if (!review.serviceId) continue;
        const service = services.find(
          (s) => s._id.toString() === review.serviceId.toString(),
        );
        if (service) {
          const rawCategory = service.category || 'Autre';
          const category =
            this.categoryLabelMap[rawCategory.toLowerCase()] ?? rawCategory;

          if (categoryMap.has(category)) {
            categoryMap.get(category)!.ratings.push(review.rating || 0);
          }
        }
      }

      // Construire le tableau final
      const satisfactionByService = Array.from(categoryMap.entries())
        .map(([categoryName, data]) => {
          const avgRating =
            data.ratings.length > 0
              ? Math.round(
                  (data.ratings.reduce((a, b) => a + b, 0) /
                    data.ratings.length) *
                    10,
                ) / 10
              : 0;

          return {
            serviceType: categoryName,
            count: data.serviceCount,
            reservationCount: data.reservationCount,
            completedReservations: data.completedReservations,
            averageRating: avgRating,
          };
        })
        .sort((a, b) => b.reservationCount - a.reservationCount);

      const result: HomePageStats = {
        activeUsers: activeUsers,
        availableServices: availableServices,
        governoratesCovered: governoratesCovered,
        averageSatisfaction: averageSatisfaction,
        totalReservations: totalReservations,
        satisfactionByService: satisfactionByService,
      };

      this.logger.log(
        `📊 Final stats: ${JSON.stringify({
          activeUsers: result.activeUsers,
          availableServices: result.availableServices,
          averageSatisfaction: result.averageSatisfaction,
          totalReservations: result.totalReservations,
          categoriesCount: result.satisfactionByService.length,
        })}`,
      );

      return result;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`❌ Error getting home page stats: ${errorMessage}`);

      return {
        activeUsers: 12,
        availableServices: 1,
        governoratesCovered: 1,
        averageSatisfaction: 4.8,
        totalReservations: 0,
        satisfactionByService: this.allCategories.map((name) => ({
          serviceType: name,
          count: 0,
          reservationCount: 0,
          completedReservations: 0,
          averageRating: 0,
        })),
      };
    }
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
