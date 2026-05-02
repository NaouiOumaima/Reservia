// backend/src/modules/admin/admin.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { User, UserSchema } from '../../database/schemas/user.schema';
import { Service, ServiceSchema } from '../../database/schemas/service.schema';
import { Reservation, ReservationSchema } from '../../database/schemas/reservation.schema';
import { Review, ReviewSchema } from '../../database/schemas/review.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Service.name, schema: ServiceSchema },
      { name: Reservation.name, schema: ReservationSchema },
      { name: Review.name, schema: ReviewSchema },
    ]),
  ],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}