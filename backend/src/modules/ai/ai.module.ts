// src/modules/ai/ai.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AiService } from './services/ai.service';
import { NlpService } from './services/nlp.service';
import { VoiceService } from './services/voice.service';
import { RecommendationService } from './services/recommendation.service';
import { Service, ServiceSchema } from '../../database/schemas/service.schema';
import { Reservation, ReservationSchema } from '../../database/schemas/reservation.schema';
import { Review, ReviewSchema } from '../../database/schemas/review.schema';
import { AiController } from './controllers/ai.controller';
import { EmailModule } from '../email/email.module';
import { User, UserSchema } from '../../database/schemas/user.schema';
import { NotificationsModule } from '../notifications/notifications.module';  // ← AJOUTER

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Service.name, schema: ServiceSchema },
      { name: Reservation.name, schema: ReservationSchema },
      { name: Review.name, schema: ReviewSchema },
      { name: User.name, schema: UserSchema }, 
    ]),
    EmailModule,
    NotificationsModule,  // ← AJOUTER CETTE LIGNE
  ],
  controllers: [AiController],
  providers: [AiService, NlpService, VoiceService, RecommendationService],
  exports: [AiService],
})
export class AiModule {}