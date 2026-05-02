// backend/src/modules/admin/admin.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../../database/schemas/user.schema';
import { Service, ServiceDocument } from '../../database/schemas/service.schema';
import { Reservation, ReservationDocument } from '../../database/schemas/reservation.schema';
import { Review, ReviewDocument } from '../../database/schemas/review.schema';

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Service.name) private serviceModel: Model<ServiceDocument>,
    @InjectModel(Reservation.name) private reservationModel: Model<ReservationDocument>,
    @InjectModel(Review.name) private reviewModel: Model<ReviewDocument>,
  ) {}

  async getStats(timeRange: 'week' | 'month' | 'year' = 'month') {
    const now = new Date();
    let startDate: Date;
    
    switch (timeRange) {
      case 'week':
        startDate = new Date(now.setDate(now.getDate() - 7));
        break;
      case 'month':
        startDate = new Date(now.setMonth(now.getMonth() - 1));
        break;
      case 'year':
        startDate = new Date(now.setFullYear(now.getFullYear() - 1));
        break;
    }

    // Statistiques utilisateurs
    const totalUsers = await this.userModel.countDocuments();
    const clients = await this.userModel.countDocuments({ role: 'client' });
    const providers = await this.userModel.countDocuments({ role: 'provider' });
    const newThisMonth = await this.userModel.countDocuments({
      createdAt: { $gte: startDate }
    });
    const activeLast30Days = await this.userModel.countDocuments({
      lastLogin: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
    });
    
    // Calcul du taux de croissance
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    const previousMonthUsers = await this.userModel.countDocuments({
      createdAt: { $lt: startDate, $gte: lastMonth }
    });
    const growthRate = previousMonthUsers > 0 
      ? Math.round(((newThisMonth - previousMonthUsers) / previousMonthUsers) * 100)
      : 100;

    // Statistiques services
    const totalServices = await this.serviceModel.countDocuments();
    const pendingServices = await this.serviceModel.countDocuments({ isActive: false, isRejected: { $ne: true } });
    const activeServices = await this.serviceModel.countDocuments({ isActive: true });
    const rejectedServices = await this.serviceModel.countDocuments({ isRejected: true });

    // Statistiques réservations
    const totalReservations = await this.reservationModel.countDocuments();
    const completedReservations = await this.reservationModel.countDocuments({ status: 'completed' });
    const cancelledReservations = await this.reservationModel.countDocuments({ status: 'cancelled' });
    const pendingReservations = await this.reservationModel.countDocuments({ status: 'pending' });

    // Évolution des utilisateurs par mois
    const usersByMonth = await this.getUsersByMonth();
    
    // Catégories par usage
    const categoriesByUsage = await this.getCategoriesByUsage();
    
    // Top catégories
    const topCategories = await this.getTopCategories();
    
    // Réservations par statut
    const reservationsByStatus = [
      { status: 'Complétées', count: completedReservations, color: '#10b981' },
      { status: 'Annulées', count: cancelledReservations, color: '#ef4444' },
      { status: 'En attente', count: pendingReservations, color: '#f59e0b' },
    ];
    
    // Géolocalisation par gouvernorat
    const byGovernorate = await this.getGovernorateStats();
    
    // Top prestataires
    const topProviders = await this.getTopProviders();
    
    // Top services
    const topServices = await this.getTopServices();
    
    // Engagement
    const clientRetentionRate = await this.getClientRetentionRate();
    const providerActivityRate = await this.getProviderActivityRate();
    const avgResponseTime = 2.5; // Valeur par défaut
    const satisfactionScore = await this.getSatisfactionScore();

    return {
      users: {
        total: totalUsers,
        clients,
        providers,
        newThisMonth,
        growthRate,
        activeLast30Days,
      },
      services: {
        total: totalServices,
        pending: pendingServices,
        active: activeServices,
        rejected: rejectedServices,
      },
      reservations: {
        total: totalReservations,
        completed: completedReservations,
        cancelled: cancelledReservations,
        pending: pendingReservations,
      },
      charts: {
        usersByMonth,
        categoriesByUsage,
        topCategories,
        reservationsByStatus,
      },
      geolocation: {
        byGovernorate,
      },
      trending: {
        topProviders,
        topServices,
      },
      engagement: {
        clientRetentionRate,
        providerActivityRate,
        avgResponseTime,
        satisfactionScore,
      },
    };
  }

  private async getUsersByMonth(): Promise<{ month: string; clients: number; providers: number }[]> {
    const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
    const result = [];
    const currentYear = new Date().getFullYear();
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(currentYear, new Date().getMonth() - i, 1);
      const month = months[date.getMonth()];
      const nextMonth = new Date(date.getFullYear(), date.getMonth() + 1, 1);
      
      const clients = await this.userModel.countDocuments({
        role: 'client',
        createdAt: { $gte: date, $lt: nextMonth }
      });
      const providers = await this.userModel.countDocuments({
        role: 'provider',
        createdAt: { $gte: date, $lt: nextMonth }
      });
      
      result.push({ month, clients, providers });
    }
    
    return result;
  }

  private async getCategoriesByUsage(): Promise<{ category: string; count: number; percentage: number }[]> {
    const categories = await this.serviceModel.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);
    
    const total = categories.reduce((sum, c) => sum + c.count, 0);
    
    return categories.map(cat => ({
      category: cat._id || 'Autres',
      count: cat.count,
      percentage: total > 0 ? Math.round((cat.count / total) * 100) : 0,
    }));
  }

  private async getTopCategories(): Promise<{ category: string; bookings: number }[]> {
    const categories = await this.reservationModel.aggregate([
      { $lookup: { from: 'services', localField: 'serviceId', foreignField: '_id', as: 'service' } },
      { $unwind: '$service' },
      { $group: { _id: '$service.category', bookings: { $sum: 1 } } },
      { $sort: { bookings: -1 } },
      { $limit: 3 }
    ]);
    
    return categories.map(cat => ({
      category: cat._id || 'Autres',
      bookings: cat.bookings,
    }));
  }

  private async getGovernorateStats() {
    const governorates = [
      'Tunis', 'Ariana', 'Ben Arous', 'Manouba', 'Nabeul', 'Zaghouan', 'Bizerte', 'Béja',
      'Jendouba', 'Le Kef', 'Siliana', 'Sousse', 'Monastir', 'Mahdia', 'Sfax', 'Kairouan',
      'Kasserine', 'Sidi Bouzid', 'Gabès', 'Médenine', 'Tataouine', 'Gafsa', 'Tozeur', 'Kébili'
    ];
    
    const result = [];
    let totalBookings = 0;
    
    // D'abord, collecter toutes les données
    for (const gov of governorates) {
      const clients = await this.userModel.countDocuments({ role: 'client', 'location.governorate': gov });
      const providers = await this.userModel.countDocuments({ role: 'provider', 'location.governorate': gov });
      const services = await this.serviceModel.countDocuments({ 'location.governorate': gov });
      
      const bookingsCount = await this.reservationModel.aggregate([
        { $lookup: { from: 'services', localField: 'serviceId', foreignField: '_id', as: 'service' } },
        { $unwind: '$service' },
        { $match: { 'service.location.governorate': gov } },
        { $count: 'count' }
      ]);
      
      const count = bookingsCount[0]?.count || 0;
      totalBookings += count;
      
      result.push({
        governorate: gov,
        clients,
        providers,
        services,
        bookings: count,
        percentage: 0,
      });
    }
    
    // Calculer les pourcentages
    return result.map(gov => ({
      ...gov,
      percentage: totalBookings > 0 ? Math.round((gov.bookings / totalBookings) * 100) : 0,
    })).sort((a, b) => b.bookings - a.bookings);
  }

  private async getTopProviders() {
    const providers = await this.userModel.aggregate([
      { $match: { role: 'provider' } },
      { $lookup: { from: 'services', localField: '_id', foreignField: 'providerId', as: 'services' } },
      { $lookup: { from: 'reservations', localField: 'services._id', foreignField: 'serviceId', as: 'bookings' } },
      { $project: { 
          id: '$_id', 
          name: { $concat: ['$firstName', ' ', '$lastName'] }, 
          bookings: { $size: '$bookings' } 
        } 
      },
      { $sort: { bookings: -1 } },
      { $limit: 3 }
    ]);
    
    // Ajouter les ratings
    for (const provider of providers) {
      const reviews = await this.reviewModel.aggregate([
        { $lookup: { from: 'services', localField: 'serviceId', foreignField: '_id', as: 'service' } },
        { $unwind: '$service' },
        { $match: { 'service.providerId': provider.id } },
        { $group: { _id: null, avgRating: { $avg: '$rating' } } }
      ]);
      provider.rating = reviews.length > 0 ? Math.round(reviews[0].avgRating * 10) / 10 : 0;
    }
    
    return providers;
  }

  private async getTopServices() {
    const services = await this.serviceModel.aggregate([
      { $lookup: { from: 'reservations', localField: '_id', foreignField: 'serviceId', as: 'bookings' } },
      { $project: { id: '$_id', name: 1, category: 1, bookings: { $size: '$bookings' } } },
      { $sort: { bookings: -1 } },
      { $limit: 3 }
    ]);
    
    return services;
  }

  private async getClientRetentionRate(): Promise<number> {
    const totalClients = await this.userModel.countDocuments({ role: 'client' });
    const activeClients = await this.userModel.countDocuments({
      role: 'client',
      lastLogin: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
    });
    
    return totalClients > 0 ? Math.round((activeClients / totalClients) * 100) : 0;
  }

  private async getProviderActivityRate(): Promise<number> {
    const totalProviders = await this.userModel.countDocuments({ role: 'provider' });
    const activeProviders = await this.userModel.countDocuments({
      role: 'provider',
      lastLogin: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
    });
    
    return totalProviders > 0 ? Math.round((activeProviders / totalProviders) * 100) : 0;
  }

  private async getSatisfactionScore(): Promise<number> {
    const reviews = await this.reviewModel.aggregate([
      { $group: { _id: null, avgRating: { $avg: '$rating' } } }
    ]);
    
    return reviews.length > 0 ? Math.round(reviews[0].avgRating * 10) / 10 : 4.5;
  }
}