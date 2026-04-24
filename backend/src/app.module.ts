import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { AuthModule } from './modules/auth/auth.module';
// import { UsersModule } from './modules/users/users.module';
// import { ServicesModule } from './modules/services/services.module';
// import { ReservationsModule } from './modules/reservations/reservations.module';
// import { ReviewsModule } from './modules/reviews/reviews.module';
// import { SearchModule } from './modules/search/search.module';
// import { NotificationsModule } from './modules/notifications/notifications.module';
// import { DashboardModule } from './modules/dashboard/dashboard.module';
// import { AiModule } from './modules/ai/ai.module';
// import { WebsocketModule } from './modules/websocket/websocket.module';
import configuration from './config/configuration';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [configuration] }),
    MongooseModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('mongodb.uri') || 'mongodb://localhost:27017/Reservation',
      }),
      inject: [ConfigService],
    }),
    JwtModule.registerAsync({
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('jwt.secret') || 'superSecretKey123!',
        signOptions: { expiresIn: '7d' },
      }),
      inject: [ConfigService],
      global: true,
    }),
    AuthModule,  // SEUL MODULE ACTIF POUR L'INSTANT
  ],
  controllers: [],  // Pas de controllers pour l'instant
  providers: [],    // Pas de providers pour l'instant
})
export class AppModule {}