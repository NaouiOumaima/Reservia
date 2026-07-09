import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { MongooseModule } from '@nestjs/mongoose';
import { AdvertisementsController } from './advertisements.controller';
import { AdvertisementsService } from './advertisements.service';
import {
  Advertisement,
  AdvertisementSchema,
} from '../../database/schemas/advertisement.schema';
import { User, UserSchema } from '../../database/schemas/user.schema';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Advertisement.name, schema: AdvertisementSchema },
      { name: User.name, schema: UserSchema },
    ]),
    // Stockage en mémoire = pas de fichier sur disque
    MulterModule.register({ storage: memoryStorage() }),
    NotificationsModule,
  ],
  controllers: [AdvertisementsController],
  providers: [AdvertisementsService],
  exports: [AdvertisementsService],
})
export class AdvertisementsModule {}
