// src/modules/ai/services/recommendation.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Service, ServiceDocument } from '../../../database/schemas/service.schema';
import { Reservation, ReservationDocument } from '../../../database/schemas/reservation.schema';
import { Review, ReviewDocument } from '../../../database/schemas/review.schema';

// Fonction utilitaire pour extraire le message d'erreur
function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  return 'Unknown error occurred';
}

@Injectable()
export class RecommendationService {
  private readonly logger = new Logger(RecommendationService.name);

  constructor(
    @InjectModel(Service.name) private serviceModel: Model<ServiceDocument>,
    @InjectModel(Reservation.name) private reservationModel: Model<ReservationDocument>,
    @InjectModel(Review.name) private reviewModel: Model<ReviewDocument>,
  ) {}

  async getPersonalizedRecommendations(userId: string, limit: number = 10): Promise<any[]> {
    try {
      const userHistory = await this.getUserHistory(userId);
      
      if (!userHistory.hasHistory) {
        return this.getPopularServices(limit);
      }

      const collaborative = await this.collaborativeFiltering(userId, limit);
      const contentBased = await this.contentBasedFiltering(userHistory, limit);
      const merged = this.mergeRecommendations(collaborative, contentBased, limit);
      const enriched = await this.enrichRecommendations(merged, userId);
      
      return enriched;
    } catch (error) {
      this.logger.error(`Recommendation error: ${getErrorMessage(error)}`);
      return this.getPopularServices(limit);
    }
  }

  private async getUserHistory(userId: string): Promise<any> {
    try {
      const reservations = await this.reservationModel
        .find({ clientId: new Types.ObjectId(userId) })
        .populate('serviceId')
        .sort({ createdAt: -1 as any })
        .limit(20)
        .exec();

      const reviews = await this.reviewModel
        .find({ userId: new Types.ObjectId(userId) })
        .populate('serviceId')
        .exec();

      const categories = new Map<string, number>();
      let totalPrice = 0;

      for (const reservation of reservations) {
        const service = reservation.serviceId as any;
        if (service && service.category) {
          const count = categories.get(service.category) || 0;
          categories.set(service.category, count + 1);
          totalPrice += service.basePrice || 0;
        }
      }

      const avgPrice = totalPrice / (reservations.length || 1);

      const preferredCategories = Array.from(categories.entries())
        .sort((a, b) => b[1] - a[1])
        .map(([category]) => category)
        .slice(0, 3);

      return {
        hasHistory: reservations.length > 0,
        preferredCategories,
        avgPrice,
        totalReservations: reservations.length,
        totalReviews: reviews.length,
      };
    } catch (error) {
      this.logger.error(`Get user history error: ${getErrorMessage(error)}`);
      return {
        hasHistory: false,
        preferredCategories: [],
        avgPrice: 0,
        totalReservations: 0,
        totalReviews: 0,
      };
    }
  }

  private async collaborativeFiltering(userId: string, limit: number): Promise<any[]> {
    try {
      const userReservations = await this.reservationModel
        .find({ clientId: new Types.ObjectId(userId) })
        .select('serviceId')
        .exec();

      const userServiceIds = userReservations.map(r => r.serviceId.toString());

      if (userServiceIds.length === 0) {
        return [];
      }

      const similarUsers = await this.reservationModel.aggregate([
        {
          $match: {
            serviceId: { $in: userServiceIds.map(id => new Types.ObjectId(id)) },
            clientId: { $ne: new Types.ObjectId(userId) },
          },
        },
        {
          $group: {
            _id: '$clientId',
            commonServices: { $sum: 1 },
          },
        },
        {
          $sort: { commonServices: -1 as any },
        },
        {
          $limit: 10,
        },
      ]);

      if (similarUsers.length === 0) {
        return [];
      }

      const similarUserIds = similarUsers.map(u => u._id);
      
      const recommendations = await this.reservationModel.aggregate([
        {
          $match: {
            clientId: { $in: similarUserIds },
            serviceId: { $nin: userServiceIds.map(id => new Types.ObjectId(id)) },
          },
        },
        {
          $group: {
            _id: '$serviceId',
            score: { $sum: 1 },
          },
        },
        {
          $sort: { score: -1 as any },
        },
        {
          $limit: limit,
        },
        {
          $lookup: {
            from: 'services',
            localField: '_id',
            foreignField: '_id',
            as: 'service',
          },
        },
        {
          $unwind: '$service',
        },
      ]);

      return recommendations.map((r: any) => r.service);
    } catch (error) {
      this.logger.error(`Collaborative filtering error: ${getErrorMessage(error)}`);
      return [];
    }
  }

  private async contentBasedFiltering(userHistory: any, limit: number): Promise<any[]> {
    try {
      if (!userHistory.preferredCategories?.length) {
        return [];
      }

      const query: any = {
        isActive: true,
        category: { $in: userHistory.preferredCategories },
      };

      if (userHistory.avgPrice > 0) {
        query.basePrice = {
          $gte: userHistory.avgPrice * 0.7,
          $lte: userHistory.avgPrice * 1.3,
        };
      }

      const services = await this.serviceModel
        .find(query)
        .sort({ popularity: -1 as any, avgRating: -1 as any })
        .limit(limit)
        .exec();

      return services;
    } catch (error) {
      this.logger.error(`Content based filtering error: ${getErrorMessage(error)}`);
      return [];
    }
  }

  private mergeRecommendations(collaborative: any[], contentBased: any[], limit: number): any[] {
    const merged = new Map();

    for (const service of collaborative) {
      if (service && service._id) {
        merged.set(service._id.toString(), {
          service,
          score: 2,
        });
      }
    }

    for (const service of contentBased) {
      if (service && service._id) {
        const id = service._id.toString();
        if (merged.has(id)) {
          merged.get(id).score += 1;
        } else {
          merged.set(id, {
            service,
            score: 1,
          });
        }
      }
    }

    const sorted = Array.from(merged.values())
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(item => item.service);

    return sorted;
  }

  private async enrichRecommendations(services: any[], userId: string): Promise<any[]> {
    const enriched = [];
    
    for (const service of services) {
      if (!service || !service._id) continue;
      
      try {
        const userReservation = await this.reservationModel.findOne({
          clientId: new Types.ObjectId(userId),
          serviceId: service._id,
        });

        enriched.push({
          ...service.toObject(),
          personalized: {
            alreadyBooked: !!userReservation,
            recommendationScore: userReservation ? 0 : this.calculatePersonalizedScore(service),
            matchReason: this.getMatchReason(service),
          },
        });
      } catch (error) {
        this.logger.error(`Enrich recommendation error for service ${service._id}: ${getErrorMessage(error)}`);
        enriched.push({
          ...service.toObject(),
          personalized: {
            alreadyBooked: false,
            recommendationScore: this.calculatePersonalizedScore(service),
            matchReason: this.getMatchReason(service),
          },
        });
      }
    }

    return enriched;
  }

  private calculatePersonalizedScore(service: any): number {
    let score = 0;
    
    if (service.avgRating >= 4.5) score += 30;
    else if (service.avgRating >= 4) score += 20;
    else if (service.avgRating >= 3.5) score += 10;
    
    if (service.popularity >= 100) score += 30;
    else if (service.popularity >= 50) score += 20;
    else if (service.popularity >= 10) score += 10;
    
    if (service.basePrice <= 100) score += 20;
    else if (service.basePrice <= 200) score += 10;
    
    return Math.min(100, score);
  }

  private getMatchReason(service: any): string {
    const reasons = [];
    
    if (service.avgRating >= 4.5) {
      reasons.push('Très bien noté par les clients');
    }
    
    if (service.popularity >= 50) {
      reasons.push('Très populaire');
    }
    
    if (service.basePrice <= 100) {
      reasons.push('Prix attractif');
    }
    
    return reasons.join(' • ') || 'Recommandé pour vous';
  }

  private async getPopularServices(limit: number): Promise<any[]> {
    try {
      return this.serviceModel
        .find({ isActive: true })
        .sort({ popularity: -1 as any, avgRating: -1 as any })
        .limit(limit)
        .exec();
    } catch (error) {
      this.logger.error(`Get popular services error: ${getErrorMessage(error)}`);
      return [];
    }
  }
}