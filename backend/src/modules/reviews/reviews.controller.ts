import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  Request,
  Query,
  ForbiddenException,
} from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import {
  CreateReviewDto,
  ReportReviewDto,
  UpdateReviewDto,
} from './dto/review.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  // ✅ Routes PUBLIQUES (pas de guard)
  @Get('service/:serviceId')
  async getServiceReviews(
    @Param('serviceId') serviceId: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return this.reviewsService.getServiceReviews(serviceId, page, limit);
  }

  @Get('app')
  async getAppReviews(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return this.reviewsService.getAppReviews(page, limit);
  }

  @Get('app/stats')
  async getAppReviewStats() {
    return this.reviewsService.getAppReviewStats();
  }

  // ✅ Créer un avis — accessible aux visiteurs non connectés (avis "app"
  // uniquement) et aux utilisateurs connectés (avis "app" ou "service").
  @UseGuards(OptionalJwtAuthGuard)
  @Post()
  async createReview(@Request() req, @Body() createReviewDto: CreateReviewDto) {
    const user = req.user;
    const author = user
      ? {
          userId: (user._id || user.id).toString(),
          userEmail: user.email,
          userName:
            `${user.firstName || ''} ${user.lastName || ''}`.trim() ||
            user.email,
        }
      : null;

    return this.reviewsService.createReview(author, createReviewDto);
  }

  // ✅ Modifier son propre avis
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async updateReview(
    @Request() req,
    @Param('id') id: string,
    @Body() updateReviewDto: UpdateReviewDto,
  ) {
    const userId = (req.user._id || req.user.id).toString();
    return this.reviewsService.updateReview(id, userId, updateReviewDto);
  }

  // ✅ Supprimer son propre avis
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async deleteMyReview(@Request() req, @Param('id') id: string) {
    const userId = (req.user._id || req.user.id).toString();
    await this.reviewsService.deleteOwnReview(id, userId);
    return { success: true, message: 'Avis supprimé' };
  }

  @UseGuards(JwtAuthGuard) // ← AJOUTÉ
  @Post(':id/report')
  async reportReview(
    @Request() req,
    @Param('id') id: string,
    @Body() reportReviewDto: ReportReviewDto,
  ) {
    return this.reviewsService.reportReview(
      id,
      req.user._id || req.user.id,
      reportReviewDto,
    );
  }

  @UseGuards(JwtAuthGuard) // ← AJOUTÉ
  @Post(':id/helpful')
  async markHelpful(@Request() req, @Param('id') id: string) {
    return this.reviewsService.markHelpful(id, req.user._id || req.user.id);
  }

  @UseGuards(JwtAuthGuard) // ← AJOUTÉ
  @Get('my')
  async getMyReviews(@Request() req) {
    return this.reviewsService.getUserReviews(req.user._id || req.user.id);
  }

  // ✅ Avis reçus par le provider connecté (toutes ses prestations)
  @UseGuards(JwtAuthGuard)
  @Get('provider')
  async getProviderReviews(
    @Request() req,
    @Query('serviceId') serviceId?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.reviewsService.getProviderReviews(req.user._id || req.user.id, {
      serviceId,
      page,
      limit,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Get('provider/stats')
  async getProviderReviewStats(@Request() req) {
    return this.reviewsService.getProviderReviewStats(
      req.user._id || req.user.id,
    );
  }

  // ✅ Routes ADMIN (avec JwtAuthGuard + vérification role)
  @UseGuards(JwtAuthGuard)
  @Get('admin/reported')
  async findReported(@Request() req) {
    // Vérification admin (optionnel)
    if (req.user.role !== 'admin') {
      throw new ForbiddenException('Accès réservé aux administrateurs');
    }
    return this.reviewsService.findReported();
  }

  @UseGuards(JwtAuthGuard)
  @Get('admin/reported/count')
  async getReportedCount(@Request() req) {
    if (req.user.role !== 'admin') {
      throw new ForbiddenException('Accès réservé aux administrateurs');
    }
    const count = await this.reviewsService.getReportedCount();
    return { count };
  }

  @UseGuards(JwtAuthGuard)
  @Post('admin/:id/approve')
  async approveReview(@Request() req, @Param('id') id: string) {
    if (req.user.role !== 'admin') {
      throw new ForbiddenException('Accès réservé aux administrateurs');
    }
    return this.reviewsService.approveReview(id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('admin/:id')
  async deleteReview(@Request() req, @Param('id') id: string) {
    if (req.user.role !== 'admin') {
      throw new ForbiddenException('Accès réservé aux administrateurs');
    }
    return this.reviewsService.deleteReview(id);
  }
  // ✅ ADMIN: Récupérer TOUS les avis (avec pagination et filtres)
  @UseGuards(JwtAuthGuard)
  @Get('admin/all')
  async getAllReviewsForAdmin(
    @Request() req,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('status') status?: 'all' | 'reported' | 'approved' | 'pending',
  ) {
    if (req.user.role !== 'admin') {
      throw new ForbiddenException('Accès réservé aux administrateurs');
    }
    return this.reviewsService.getAllReviewsForAdmin(page, limit, status);
  }
}
