// backend/src/reviews/reviews.module.ts
import { Module, OnModuleInit } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ReviewsService } from './reviews.service';
import { ReviewsController } from './reviews.controller';
import { Review, ReviewSchema } from '../../database/schemas/review.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Review.name, schema: ReviewSchema }]),
  ],
  controllers: [ReviewsController],
  providers: [ReviewsService],
  exports: [ReviewsService],
})
export class ReviewsModule implements OnModuleInit {
  constructor(
    @InjectModel(Review.name) private reviewModel: Model<Review>,
  ) {}

  async onModuleInit() {
    try {
      // Liste tous les indexes
      const indexes = await this.reviewModel.collection.indexes();
      console.log('📋 Indexes existants:', indexes.map(i => i.name));
      
      // Supprimer l'index problématique
      await this.reviewModel.collection.dropIndex('userId_1_serviceId_1').catch(() => {});
      console.log('✅ Index userId_1_serviceId_1 supprimé');
      
      // Supprimer aussi l'index automatique si présent
      await this.reviewModel.collection.dropIndex('userId_1_serviceId_1').catch(() => {});
    } catch (error: any) {
      if (error.code === 27) {
        console.log('ℹ️ Index déjà supprimé');
      } else {
        console.log('Erreur:', error.message);
      }
    }
  }
}