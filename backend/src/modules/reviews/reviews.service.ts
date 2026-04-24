// src/modules/reviews/reviews.service.ts

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Review, ReviewDocument } from '../../database/schemas/review.schema';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectModel(Review.name) private reviewModel: Model<ReviewDocument>,
  ) {}

  async findReported(): Promise<Review[]> {
    return this.reviewModel
      .find({ isReported: true })
      .populate('userId', 'firstName lastName')
      .populate('serviceId', 'name')
      .exec();
  }

  async deleteReview(reviewId: string): Promise<Review> {
    return this.reviewModel.findByIdAndDelete(reviewId).exec();
  }

  async dismissReport(reviewId: string): Promise<Review> {
    return this.reviewModel.findByIdAndUpdate(
      reviewId,
      { isReported: false },
      { new: true },
    ).exec();
  }

  async getReportedCount(): Promise<number> {
    return this.reviewModel.countDocuments({ isReported: true });
  }
}