// src/modules/dashboard/dashboard.module.ts

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { Reservation, ReservationSchema } from '../../database/schemas/reservation.schema';
import { Service, ServiceSchema } from '../../database/schemas/service.schema';
import { Review, ReviewSchema } from '../../database/schemas/review.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Reservation.name, schema: ReservationSchema },
      { name: Service.name, schema: ServiceSchema },
      { name: Review.name, schema: ReviewSchema },
    ]),
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
  exports: [DashboardService],
})
export class DashboardModule {}