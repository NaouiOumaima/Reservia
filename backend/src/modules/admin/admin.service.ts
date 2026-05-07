// backend/src/modules/admin/admin.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from '../../database/schemas/user.schema';
import { Service, ServiceDocument } from '../../database/schemas/service.schema';
import { Reservation, ReservationDocument } from '../../database/schemas/reservation.schema';
import { Review, ReviewDocument } from '../../database/schemas/review.schema';

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(User.name)        private userModel:        Model<UserDocument>,
    @InjectModel(Service.name)     private serviceModel:     Model<ServiceDocument>,
    @InjectModel(Reservation.name) private reservationModel: Model<ReservationDocument>,
    @InjectModel(Review.name)      private reviewModel:      Model<ReviewDocument>,
  ) {}

  // ─── Public entry point ────────────────────────────────────────────────────
  async getStats(timeRange: 'week' | 'month' | 'year' = 'month') {
    const startDate = this.getStartDate(timeRange);

    // ── Users ──────────────────────────────────────────────────────────────
    const [totalUsers, clients, providers, admins, newUsersThisPeriod, activeUsers30d] =
      await Promise.all([
        this.userModel.countDocuments(),
        this.userModel.countDocuments({ role: 'client' }),
        this.userModel.countDocuments({ role: 'provider' }),
        this.userModel.countDocuments({ role: 'admin' }),
        this.userModel.countDocuments({ createdAt: { $gte: startDate } }),
        this.userModel.countDocuments({
          lastLogin: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
        }),
      ]);

    // growth rate: compare current period with same-length previous period
    const periodMs    = Date.now() - startDate.getTime();
    const prevStart   = new Date(startDate.getTime() - periodMs);
    const previousUsers = await this.userModel.countDocuments({
      createdAt: { $gte: prevStart, $lt: startDate },
    });
    const growthRate =
      previousUsers > 0
        ? Math.round(((newUsersThisPeriod - previousUsers) / previousUsers) * 100)
        : newUsersThisPeriod > 0 ? 100 : 0;

    // ── Services ───────────────────────────────────────────────────────────
    const [totalServices, pendingServices, activeServices, rejectedServices] =
      await Promise.all([
        this.serviceModel.countDocuments(),
        this.serviceModel.countDocuments({ isActive: false, isRejected: { $ne: true } }),
        this.serviceModel.countDocuments({ isActive: true }),
        this.serviceModel.countDocuments({ isRejected: true }),
      ]);

    // ── Reservations ───────────────────────────────────────────────────────
    const [totalReservations, completedReservations, cancelledReservations, pendingReservations] =
      await Promise.all([
        this.reservationModel.countDocuments(),
        this.reservationModel.countDocuments({ status: 'completed' }),
        this.reservationModel.countDocuments({ status: 'cancelled' }),
        this.reservationModel.countDocuments({ status: 'pending' }),
      ]);

    // ── Reviews ────────────────────────────────────────────────────────────
    const [totalReviews, averageRating] = await Promise.all([
      this.reviewModel.countDocuments(),
      this.getAverageRating(),
    ]);

    // ── Charts (all parallelised) ──────────────────────────────────────────
    const [
      usersByMonth,
      servicesByMonth,
      reservationsByMonth,
      reservationsByDayOfWeek,
      reservationsByHour,
      categoriesDistribution,
      topCategories,
      governorateStats,
    ] = await Promise.all([
      this.getUsersByMonth(),
      this.getServicesByMonth(),
      this.getReservationsByMonth(),
      this.getReservationsByDayOfWeek(),
      this.getReservationsByHour(),
      this.getCategoriesDistribution(),
      this.getTopCategories(),
      this.getGovernorateStats(),
    ]);

    // ── Engagement (parallelised) ──────────────────────────────────────────
    const [clientRetention, providerActivity, conversionRate, repeatCustomers] =
      await Promise.all([
        this.getClientRetentionRate(),
        this.getProviderActivityRate(),
        this.getConversionRate(),
        this.getRepeatCustomersRate(),
      ]);

    // ── Trending (parallelised) ────────────────────────────────────────────
    const [topProviders, topServicesList] = await Promise.all([
      this.getTopProviders(),
      this.getTopServices(),
    ]);

    return {
      users: { total: totalUsers, clients, providers, admins, newThisPeriod: newUsersThisPeriod, activeLast30Days: activeUsers30d, growthRate },
      services:     { total: totalServices, pending: pendingServices, active: activeServices, rejected: rejectedServices },
      reservations: { total: totalReservations, completed: completedReservations, cancelled: cancelledReservations, pending: pendingReservations },
      reviews:      { total: totalReviews, averageRating },
      charts:       { usersByMonth, servicesByMonth, reservationsByMonth, reservationsByDayOfWeek, reservationsByHour, categoriesDistribution, topCategories, governorateStats },
      engagement:   { clientRetention, providerActivity, conversionRate, satisfactionScore: averageRating, repeatCustomers },
      trending:     { topProviders, topServices: topServicesList },
    };
  }

  // ─── Private helpers ───────────────────────────────────────────────────────

  private getStartDate(timeRange: 'week' | 'month' | 'year'): Date {
    const now = new Date();
    switch (timeRange) {
      case 'week':  return new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
      case 'month': return new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
      case 'year':  return new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
    }
  }

  // ── Users by month (last 6 months) ────────────────────────────────────────
  private async getUsersByMonth() {
    const MONTH_LABELS = ['Jan','Fév','Mar','Avr','Mai','Juin','Juil','Aoû','Sep','Oct','Nov','Déc'];
    const now = new Date();

    // Build date boundaries for 6 months
    const boundaries = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
      return d;
    });

    // Single aggregation for each role — much faster than 12 individual queries
    const [clientsAgg, providersAgg] = await Promise.all([
      this.userModel.aggregate([
        { $match: { role: 'client', createdAt: { $gte: boundaries[0] } } },
        { $group: { _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } }, count: { $sum: 1 } } },
      ]),
      this.userModel.aggregate([
        { $match: { role: 'provider', createdAt: { $gte: boundaries[0] } } },
        { $group: { _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } }, count: { $sum: 1 } } },
      ]),
    ]);

    const toMap = (agg: { _id: { year: number; month: number }; count: number }[]) =>
      new Map(agg.map(a => [`${a._id.year}-${a._id.month}`, a.count]));

    const cMap = toMap(clientsAgg);
    const pMap = toMap(providersAgg);

    return boundaries.slice(0, 6).map((d) => {
      const key     = `${d.getFullYear()}-${d.getMonth() + 1}`;
      const clients   = cMap.get(key) ?? 0;
      const providers = pMap.get(key) ?? 0;
      return { month: MONTH_LABELS[d.getMonth()], clients, providers, total: clients + providers };
    });
  }

  // ── Services by month (last 6 months) ─────────────────────────────────────
  private async getServicesByMonth() {
    const MONTH_LABELS = ['Jan','Fév','Mar','Avr','Mai','Juin','Juil','Aoû','Sep','Oct','Nov','Déc'];
    const now = new Date();
    const since = new Date(now.getFullYear(), now.getMonth() - 5, 1);

    const agg = await this.serviceModel.aggregate([
      { $match: { createdAt: { $gte: since } } },
      { $group: { _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } }, count: { $sum: 1 } } },
    ]);
    const map = new Map(agg.map(a => [`${a._id.year}-${a._id.month}`, a.count]));

    return Array.from({ length: 6 }, (_, i) => {
      const d   = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
      const key = `${d.getFullYear()}-${d.getMonth() + 1}`;
      return { month: MONTH_LABELS[d.getMonth()], count: map.get(key) ?? 0 };
    });
  }

  // ── Reservations by month (last 6 months) ─────────────────────────────────
  private async getReservationsByMonth() {
    const MONTH_LABELS = ['Jan','Fév','Mar','Avr','Mai','Juin','Juil','Aoû','Sep','Oct','Nov','Déc'];
    const now = new Date();
    const since = new Date(now.getFullYear(), now.getMonth() - 5, 1);

    const agg = await this.reservationModel.aggregate([
      { $match: { createdAt: { $gte: since } } },
      { $group: { _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } }, count: { $sum: 1 } } },
    ]);
    const map = new Map(agg.map(a => [`${a._id.year}-${a._id.month}`, a.count]));

    return Array.from({ length: 6 }, (_, i) => {
      const d   = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
      const key = `${d.getFullYear()}-${d.getMonth() + 1}`;
      return { month: MONTH_LABELS[d.getMonth()], count: map.get(key) ?? 0 };
    });
  }

  // ── Reservations by day of week ────────────────────────────────────────────
  // $dayOfWeek: 1=Sunday … 7=Saturday  →  remap to Mon-Sun
  private async getReservationsByDayOfWeek() {
    const DAYS = ['Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi','Dimanche'];

    const agg = await this.reservationModel.aggregate([
      { $group: { _id: { $dayOfWeek: '$createdAt' }, count: { $sum: 1 } } },
    ]);

    // MongoDB: 1=Sun,2=Mon,...,7=Sat  →  convert to 0=Mon index
    const map = new Map(agg.map(a => [a._id as number, a.count as number]));
    const counts = [2, 3, 4, 5, 6, 7, 1].map(dow => map.get(dow) ?? 0); // Mon→Sun
    const total  = counts.reduce((s, c) => s + c, 0);

    return DAYS.map((day, i) => ({
      day,
      count: counts[i],
      percentage: total > 0 ? Math.round((counts[i] / total) * 100) : 0,
    }));
  }

  // ── Reservations by hour ───────────────────────────────────────────────────
  private async getReservationsByHour() {
    const agg = await this.reservationModel.aggregate([
      { $group: { _id: { $hour: '$createdAt' }, count: { $sum: 1 } } },
    ]);
    const map = new Map(agg.map(a => [a._id as number, a.count as number]));
    return Array.from({ length: 24 }, (_, h) => ({ hour: h, count: map.get(h) ?? 0 }));
  }

  // ── Categories distribution ────────────────────────────────────────────────
  private async getCategoriesDistribution() {
    const COLORS_PALETTE = [
      '#378ADD','#E24B4A','#1D9E75','#EF9F27','#7F77DD',
      '#D4537E','#06b6d4','#639922',
    ];

    const categories = await this.serviceModel.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    const total = categories.reduce((s, c) => s + c.count, 0);
    return categories.map((cat, idx) => ({
      category:   cat._id ?? 'Autres',
      count:      cat.count,
      percentage: total > 0 ? Math.round((cat.count / total) * 100) : 0,
      color:      COLORS_PALETTE[idx % COLORS_PALETTE.length],
    }));
  }

  // ── Top categories by bookings ─────────────────────────────────────────────
  private async getTopCategories() {
    const categories = await this.reservationModel.aggregate([
      {
        $lookup: {
          from: 'services', localField: 'serviceId', foreignField: '_id', as: 'service',
        },
      },
      { $unwind: '$service' },
      { $group: { _id: '$service.category', bookings: { $sum: 1 } } },
      { $sort: { bookings: -1 } },
      { $limit: 8 },
    ]);

    return categories.map(c => ({ category: c._id ?? 'Autres', bookings: c.bookings }));
  }

  // ── Governorate stats ──────────────────────────────────────────────────────
  private async getGovernorateStats() {
    // Aggregate bookings per governorate via service lookup
    const bookingsAgg = await this.reservationModel.aggregate([
      { $lookup: { from: 'services', localField: 'serviceId', foreignField: '_id', as: 'service' } },
      { $unwind: '$service' },
      { $match: { 'service.location.governorate': { $exists: true, $ne: '' } } },
      { $group: { _id: '$service.location.governorate', bookings: { $sum: 1 } } },
      { $sort: { bookings: -1 } },
    ]);

    const governorates = bookingsAgg.map(b => b._id as string);
    const totalBookings = bookingsAgg.reduce((s, b) => s + b.bookings, 0);

    // Parallel lookup: clients, providers, services per governorate
    const [clientsAgg, providersAgg, servicesAgg] = await Promise.all([
      this.userModel.aggregate([
        { $match: { role: 'client', 'location.governorate': { $in: governorates } } },
        { $group: { _id: '$location.governorate', count: { $sum: 1 } } },
      ]),
      this.userModel.aggregate([
        { $match: { role: 'provider', 'location.governorate': { $in: governorates } } },
        { $group: { _id: '$location.governorate', count: { $sum: 1 } } },
      ]),
      this.serviceModel.aggregate([
        { $match: { 'location.governorate': { $in: governorates } } },
        { $group: { _id: '$location.governorate', count: { $sum: 1 } } },
      ]),
    ]);

    const toMap = (agg: { _id: string; count: number }[]) =>
      new Map(agg.map(a => [a._id, a.count]));

    const cMap  = toMap(clientsAgg);
    const pMap  = toMap(providersAgg);
    const sMap  = toMap(servicesAgg);

    return bookingsAgg.map(b => ({
      governorate: b._id,
      clients:     cMap.get(b._id)  ?? 0,
      providers:   pMap.get(b._id)  ?? 0,
      services:    sMap.get(b._id)  ?? 0,
      bookings:    b.bookings,
      percentage:  totalBookings > 0 ? Math.round((b.bookings / totalBookings) * 100) : 0,
    }));
  }

  // ── Average rating ─────────────────────────────────────────────────────────
  private async getAverageRating(): Promise<number> {
    const agg = await this.reviewModel.aggregate([
      { $group: { _id: null, avg: { $avg: '$rating' } } },
    ]);
    return agg.length > 0 ? Math.round(agg[0].avg * 10) / 10 : 0;
  }

  // ── Client retention rate ──────────────────────────────────────────────────
  private async getClientRetentionRate(): Promise<number> {
    const [totalClients, returningAgg] = await Promise.all([
      this.userModel.countDocuments({ role: 'client' }),
      this.reservationModel.aggregate([
        { $group: { _id: '$userId', count: { $sum: 1 } } },
        { $match: { count: { $gt: 1 } } },
        { $count: 'returning' },
      ]),
    ]);
    const returning = returningAgg[0]?.returning ?? 0;
    return totalClients > 0 ? Math.round((returning / totalClients) * 100) : 0;
  }

  // ── Provider activity rate (active last 30 days) ───────────────────────────
  private async getProviderActivityRate(): Promise<number> {
    const [total, active] = await Promise.all([
      this.userModel.countDocuments({ role: 'provider' }),
      this.userModel.countDocuments({
        role: 'provider',
        lastLogin: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
      }),
    ]);
    return total > 0 ? Math.round((active / total) * 100) : 0;
  }

  // ── Conversion rate (bookings / total users) ───────────────────────────────
  private async getConversionRate(): Promise<number> {
    const [visitors, bookings] = await Promise.all([
      this.userModel.countDocuments({ role: 'client' }),
      this.reservationModel.countDocuments(),
    ]);
    return visitors > 0 ? Math.round((bookings / visitors) * 100) : 0;
  }

  // ── Repeat customers rate ──────────────────────────────────────────────────
  private async getRepeatCustomersRate(): Promise<number> {
    const [distinctAgg, repeatAgg] = await Promise.all([
      this.reservationModel.aggregate([
        { $group: { _id: '$userId' } },
        { $count: 'total' },
      ]),
      this.reservationModel.aggregate([
        { $group: { _id: '$userId', count: { $sum: 1 } } },
        { $match: { count: { $gt: 1 } } },
        { $count: 'repeat' },
      ]),
    ]);
    const distinct = distinctAgg[0]?.total ?? 0;
    const repeat   = repeatAgg[0]?.repeat  ?? 0;
    return distinct > 0 ? Math.round((repeat / distinct) * 100) : 0;
  }

  // ── Top providers ──────────────────────────────────────────────────────────
  private async getTopProviders() {
    const providers = await this.userModel.aggregate([
      { $match: { role: 'provider' } },
      {
        $lookup: {
          from: 'services', localField: '_id', foreignField: 'providerId', as: 'services',
        },
      },
      {
        $lookup: {
          from: 'reservations', localField: 'services._id', foreignField: 'serviceId', as: 'bookings',
        },
      },
      {
        $project: {
          id:       '$_id',
          name:     { $concat: ['$firstName', ' ', '$lastName'] },
          bookings: { $size: '$bookings' },
        },
      },
      { $sort: { bookings: -1 } },
      { $limit: 5 },
    ]);

    // Fetch ratings in parallel
    const withRatings = await Promise.all(
      providers.map(async (p) => {
        const ratingAgg = await this.reviewModel.aggregate([
          {
            $lookup: {
              from: 'services', localField: 'serviceId', foreignField: '_id', as: 'service',
            },
          },
          { $unwind: '$service' },
          { $match: { 'service.providerId': new Types.ObjectId(p.id) } },
          { $group: { _id: null, avgRating: { $avg: '$rating' } } },
        ]);
        const rating = ratingAgg.length > 0 ? Math.round(ratingAgg[0].avgRating * 10) / 10 : 0;
        return { id: String(p.id), name: p.name, bookings: p.bookings, rating };
      }),
    );

    return withRatings;
  }

  // ── Top services ───────────────────────────────────────────────────────────
  private async getTopServices() {
    const services = await this.serviceModel.aggregate([
      {
        $lookup: {
          from: 'reservations', localField: '_id', foreignField: 'serviceId', as: 'bookings',
        },
      },
      {
        $project: {
          id:       '$_id',
          name:     1,
          category: 1,
          bookings: { $size: '$bookings' },
        },
      },
      { $sort: { bookings: -1 } },
      { $limit: 5 },
    ]);

    return services.map(s => ({
      id:       String(s.id),
      name:     s.name,
      category: s.category,
      bookings: s.bookings,
    }));
  }
}