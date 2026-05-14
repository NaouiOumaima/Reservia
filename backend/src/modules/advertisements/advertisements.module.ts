// backend/src/modules/advertisements/advertisements.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AdvertisementsService } from './advertisements.service';
import { Advertisement, AdvertisementSchema } from '../../database/schemas/advertisement.schema';
import { User, UserSchema } from '../../database/schemas/user.schema'; // ✅ Ajouter
import { NotificationsModule } from '../notifications/notifications.module';
import { AdvertisementsController } from './advertisements.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Advertisement.name, schema: AdvertisementSchema },
      { name: User.name, schema: UserSchema }, 
    ]),
    NotificationsModule,
  ],
  controllers: [AdvertisementsController],
  providers: [AdvertisementsService],
  exports: [AdvertisementsService],
})
export class AdvertisementsModule {}