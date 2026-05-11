import { Injectable, ForbiddenException, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Review, ReviewDocument } from '../../database/schemas/review.schema';
import { CreateReviewDto, ReportReviewDto, RespondToReviewDto } from './dto/review.dto';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectModel(Review.name) private reviewModel: Model<ReviewDocument>,
  ) {}

  // ✅ Créer un avis (service ou app)
 async createReview(
  userId: string,
  userEmail: string,
  userName: string,
  createReviewDto: CreateReviewDto,
): Promise<Review> {
  console.log('=== SERVICE CREATE REVIEW ===');
  console.log('userId:', userId);
  console.log('userEmail:', userEmail);
  console.log('userName:', userName);
  console.log('createReviewDto:', createReviewDto);
  
  const { serviceId, rating, comment, images } = createReviewDto;
  
  try {
    if (serviceId) {
      console.log('📝 Creating SERVICE review');
      // ... code existant
    } else {
      console.log('📝 Creating APP review');
      const review = new this.reviewModel({
        userId: new Types.ObjectId(userId),
        userName,
        userEmail,
        reviewType: 'app',
        rating,
        comment,
        images: images || [],
        isApproved: true,
        isReported: false,
        isDeleted: false,
        helpful: 0,
      });
      
      console.log('Review object before save:', review);
      const saved = await review.save();
      console.log('✅ Review saved:', saved);
      return saved;
    }
  } catch (error) {
    console.error('❌ Error in createReview:', error);
    throw error;
  }
}

  // ✅ Récupérer les avis d'un service
  async getServiceReviews(
    serviceId: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<{ reviews: Review[]; total: number; averageRating: number }> {
    const skip = (page - 1) * limit;

    const [reviews, total, stats] = await Promise.all([
      this.reviewModel
        .find({
          serviceId: new Types.ObjectId(serviceId),
          reviewType: 'service',
          isDeleted: false,
          isApproved: true,
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.reviewModel.countDocuments({
        serviceId: new Types.ObjectId(serviceId),
        reviewType: 'service',
        isDeleted: false,
        isApproved: true,
      }),
      this.reviewModel.aggregate([
        { 
          $match: { 
            serviceId: new Types.ObjectId(serviceId), 
            reviewType: 'service',
            isDeleted: false, 
            isApproved: true 
          } 
        },
        { $group: { _id: null, avgRating: { $avg: '$rating' } } },
      ]),
    ]);

    return {
      reviews,
      total,
      averageRating: stats[0]?.avgRating || 0,
    };
  }

  // ✅ Récupérer les avis sur l'application
  async getAppReviews(page: number = 1, limit: number = 10): Promise<{ reviews: Review[]; total: number; averageRating: number }> {
    const skip = (page - 1) * limit;

    const [reviews, total, stats] = await Promise.all([
      this.reviewModel
        .find({
          reviewType: 'app',
          isDeleted: false,
          isApproved: true,
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.reviewModel.countDocuments({
        reviewType: 'app',
        isDeleted: false,
        isApproved: true,
      }),
      this.reviewModel.aggregate([
        { $match: { reviewType: 'app', isDeleted: false, isApproved: true } },
        { $group: { _id: null, avgRating: { $avg: '$rating' } } },
      ]),
    ]);

    return {
      reviews,
      total,
      averageRating: stats[0]?.avgRating || 0,
    };
  }

  // ✅ Récupérer les statistiques des avis app
  async getAppReviewStats(): Promise<{ 
    averageRating: number; 
    totalReviews: number; 
    ratingDistribution: { rating: number; count: number }[] 
  }> {
    const stats = await this.reviewModel.aggregate([
      { $match: { reviewType: 'app', isDeleted: false, isApproved: true } },
      { 
        $group: { 
          _id: null, 
          avgRating: { $avg: '$rating' }, 
          totalReviews: { $sum: 1 },
          ratings: { $push: '$rating' }
        } 
      },
    ]);

    // Calculer la distribution des notes
    const distribution = [1, 2, 3, 4, 5].map(rating => ({
      rating,
      count: stats[0]?.ratings?.filter((r: number) => r === rating).length || 0,
    }));

    return {
      averageRating: stats[0]?.avgRating || 0,
      totalReviews: stats[0]?.totalReviews || 0,
      ratingDistribution: distribution,
    };
  }

  // ✅ Récupérer tous les avis d'un utilisateur
  async getUserReviews(userId: string): Promise<Review[]> {
    return this.reviewModel
      .find({ 
        userId: new Types.ObjectId(userId), 
        isDeleted: false 
      })
      .sort({ createdAt: -1 })
      .exec();
  }

  // ✅ ADMIN: Récupérer TOUS les avis avec filtres
async getAllReviewsForAdmin(
  page: number = 1,
  limit: number = 10,
  status: 'all' | 'reported' | 'approved' | 'pending' = 'all',
): Promise<{ reviews: Review[]; total: number; stats: any }> {
  const skip = (page - 1) * limit;
  
  // Construire le filtre
  let filter: any = { isDeleted: false };
  
  switch (status) {
    case 'reported':
      filter.isReported = true;
      break;
    case 'approved':
      filter.isApproved = true;
      filter.isReported = false;
      break;
    case 'pending':
      filter.isApproved = false;
      break;
    default:
      // 'all' - pas de filtre supplémentaire
      break;
  }
  
  // Statistiques globales
  const stats = await this.reviewModel.aggregate([
    { $match: { isDeleted: false } },
    { 
      $group: { 
        _id: null,
        total: { $sum: 1 },
        reported: { $sum: { $cond: ['$isReported', 1, 0] } },
        approved: { $sum: { $cond: ['$isApproved', 1, 0] } },
        pending: { $sum: { $cond: [{ $eq: ['$isApproved', false] }, 1, 0] } },
        averageRating: { $avg: '$rating' }
      } 
    }
  ]);
  
  const [reviews, total] = await Promise.all([
    this.reviewModel
      .find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('userId', 'firstName lastName email')
      .populate('serviceId', 'name')
      .exec(),
    this.reviewModel.countDocuments(filter),
  ]);
  
  return {
    reviews,
    total,
    stats: stats[0] || { total: 0, reported: 0, approved: 0, pending: 0, averageRating: 0 },
  };
}
  // ✅ Récupérer tous les avis (admin)
  async getAllReviews(page: number = 1, limit: number = 10): Promise<{ reviews: Review[]; total: number }> {
    const skip = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
      this.reviewModel
        .find({ isDeleted: false })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('userId', 'firstName lastName email')
        .populate('serviceId', 'name')
        .exec(),
      this.reviewModel.countDocuments({ isDeleted: false }),
    ]);

    return { reviews, total };
  }

  // ✅ Signaler un avis
  async reportReview(reviewId: string, userId: string, reportReviewDto: ReportReviewDto): Promise<Review> {
    const review = await this.reviewModel.findById(reviewId);
    if (!review) {
      throw new NotFoundException('Avis non trouvé');
    }
    if (review.isDeleted) {
      throw new BadRequestException('Cet avis a été supprimé');
    }
    if (review.userId.toString() === userId) {
      throw new BadRequestException('Vous ne pouvez pas signaler votre propre avis');
    }

    review.isReported = true;
    review.reportReason = reportReviewDto.reason;
    review.reportDetails = reportReviewDto.details;
    review.reportedAt = new Date();

    return review.save();
  }

  // ✅ Marquer un avis comme utile
  async markHelpful(reviewId: string, userId: string): Promise<Review> {
    const review = await this.reviewModel.findById(reviewId);
    if (!review) {
      throw new NotFoundException('Avis non trouvé');
    }
    
    // Empêcher un utilisateur de voter plusieurs fois (optionnel)
    // À implémenter avec une collection séparée si besoin
    
    review.helpful += 1;
    return review.save();
  }

  // ✅ ADMIN: Récupérer tous les avis signalés
  async findReported(): Promise<Review[]> {
    return this.reviewModel
      .find({ isReported: true, isDeleted: false })
      .sort({ reportedAt: -1 })
      .populate('userId', 'firstName lastName email')
      .populate('serviceId', 'name')
      .exec();
  }

  // ✅ ADMIN: Compter les avis signalés
  async getReportedCount(): Promise<number> {
    return this.reviewModel.countDocuments({ isReported: true, isDeleted: false });
  }

  // ✅ ADMIN: Approuver un avis (garder malgré signalement)
  async approveReview(reviewId: string): Promise<Review> {
    const review = await this.reviewModel.findById(reviewId);
    if (!review) {
      throw new NotFoundException('Avis non trouvé');
    }

    review.isReported = false;
    review.reportReason = undefined;
    review.reportDetails = undefined;
    review.reportedAt = undefined;

    return review.save();
  }

  // ✅ ADMIN: Supprimer un avis (soft delete)
  async deleteReview(reviewId: string): Promise<Review> {
    const review = await this.reviewModel.findById(reviewId);
    if (!review) {
      throw new NotFoundException('Avis non trouvé');
    }

    review.isDeleted = true;
    review.deletedAt = new Date();
    review.isReported = false;

    return review.save();
  }

  // ✅ ADMIN: Suppression définitive (hard delete)
  async hardDeleteReview(reviewId: string): Promise<void> {
    const review = await this.reviewModel.findById(reviewId);
    if (!review) {
      throw new NotFoundException('Avis non trouvé');
    }

    await this.reviewModel.findByIdAndDelete(reviewId);
  }

  // ✅ Récupérer la note moyenne d'un service
  async getServiceAverageRating(serviceId: string): Promise<number> {
    const stats = await this.reviewModel.aggregate([
      { 
        $match: { 
          serviceId: new Types.ObjectId(serviceId), 
          reviewType: 'service',
          isDeleted: false, 
          isApproved: true 
        } 
      },
      { $group: { _id: null, avgRating: { $avg: '$rating' } } },
    ]);

    return stats[0]?.avgRating || 0;
  }

  // ✅ Récupérer la note moyenne globale de l'application
  async getAppAverageRating(): Promise<number> {
    const stats = await this.reviewModel.aggregate([
      { $match: { reviewType: 'app', isDeleted: false, isApproved: true } },
      { $group: { _id: null, avgRating: { $avg: '$rating' } } },
    ]);

    return stats[0]?.avgRating || 0;
  }

  // ✅ Vérifier si l'utilisateur a déjà laissé un avis pour un service
  async hasUserReviewedService(userId: string, serviceId: string): Promise<boolean> {
    const review = await this.reviewModel.findOne({
      userId: new Types.ObjectId(userId),
      serviceId: new Types.ObjectId(serviceId),
      reviewType: 'service',
      isDeleted: false,
    });

    return !!review;
  }

  // ✅ Récupérer les avis récents (pour dashboard)
  async getRecentReviews(limit: number = 5): Promise<Review[]> {
    return this.reviewModel
      .find({ isDeleted: false, isApproved: true })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('userId', 'firstName lastName email')
      .populate('serviceId', 'name')
      .exec();
  }

  // ✅ Récupérer les avis par note
  async getReviewsByRating(rating: number, page: number = 1, limit: number = 10): Promise<{ reviews: Review[]; total: number }> {
    const skip = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
      this.reviewModel
        .find({ rating, isDeleted: false, isApproved: true })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('userId', 'firstName lastName email')
        .populate('serviceId', 'name')
        .exec(),
      this.reviewModel.countDocuments({ rating, isDeleted: false, isApproved: true }),
    ]);

    return { reviews, total };
  }

  // ============================================
  // HELPERS PRIVÉS (à adapter selon votre modèle Service)
  // ============================================
  
  private async getServiceById(serviceId: string): Promise<any> {
    // À implémenter selon votre modèle Service
    // Exemple avec Mongoose:
    // const service = await this.serviceModel.findById(serviceId).exec();
    // return service;
    
    // Exemple temporaire pour le développement
    return {
      id: serviceId,
      name: 'Nom du service',
      providerId: null,
    };
  }

  private async updateServiceRating(serviceId: string): Promise<void> {
    // À implémenter selon votre modèle Service
    // Calcule la moyenne des avis pour ce service et met à jour
    const avgRating = await this.getServiceAverageRating(serviceId);
    
    // Exemple:
    // await this.serviceModel.findByIdAndUpdate(serviceId, {
    //   rating: avgRating,
    // });
  }
}