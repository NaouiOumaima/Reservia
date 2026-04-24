// src/modules/reviews/reviews.controller.ts

import { Controller, Get, Delete, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
@Controller('reviews')
@UseGuards(JwtAuthGuard)
export class ReviewsController {
  constructor(private reviewsService: ReviewsService) {}

  // Admin endpoints
  @Get('admin/reported')
  async findReported() {
    return this.reviewsService.findReported();
  }

  @Delete('admin/:id')
  async deleteReview(@Param('id') id: string) {
    return this.reviewsService.deleteReview(id);
  }

  @Patch('admin/:id/dismiss')
  async dismissReport(@Param('id') id: string) {
    return this.reviewsService.dismissReport(id);
  }

  @Get('admin/reported/count')
  async getReportedCount() {
    const count = await this.reviewsService.getReportedCount();
    return { count };
  }
}