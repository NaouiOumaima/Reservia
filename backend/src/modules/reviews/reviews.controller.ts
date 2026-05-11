import { Controller, Get, Post, Delete, Patch, Param, Body, UseGuards, Request, Query, ForbiddenException } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto, ReportReviewDto } from './dto/review.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

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

  // ✅ Routes PROTÉGÉES (avec JwtAuthGuard)
  @UseGuards(JwtAuthGuard)  // ← AJOUTÉ
  @Post()
  async createReview(@Request() req, @Body() createReviewDto: CreateReviewDto) {
    console.log('=== CREATE REVIEW ===');
    console.log('User from token:', req.user);
    
    const user = req.user;
    
    return this.reviewsService.createReview(
      user._id || user.id,
      user.email,
      `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email,
      createReviewDto,
    );
  }

  @UseGuards(JwtAuthGuard)  // ← AJOUTÉ
  @Post(':id/report')
  async reportReview(@Request() req, @Param('id') id: string, @Body() reportReviewDto: ReportReviewDto) {
    return this.reviewsService.reportReview(id, req.user._id || req.user.id, reportReviewDto);
  }

  @UseGuards(JwtAuthGuard)  // ← AJOUTÉ
  @Post(':id/helpful')
  async markHelpful(@Request() req, @Param('id') id: string) {
    return this.reviewsService.markHelpful(id, req.user._id || req.user.id);
  }

  @UseGuards(JwtAuthGuard)  // ← AJOUTÉ
  @Get('my')
  async getMyReviews(@Request() req) {
    return this.reviewsService.getUserReviews(req.user._id || req.user.id);
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