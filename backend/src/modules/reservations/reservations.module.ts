// src/modules/reservations/reservations.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ReservationsService } from './reservations.service';
import { ReservationsController } from './reservations.controller';
import { Reservation, ReservationSchema } from '../../database/schemas/reservation.schema';
import { Service, ServiceSchema } from '../../database/schemas/service.schema';
import { NotificationsModule } from '../notifications/notifications.module';
import { WebsocketModule } from '../websocket/websocket.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Reservation.name, schema: ReservationSchema },
      { name: Service.name, schema: ServiceSchema },
    ]),
    NotificationsModule,
    WebsocketModule,  // ← IMPORTANT pour le WebSocket
  ],
  controllers: [ReservationsController],
  providers: [ReservationsService],
  exports: [ReservationsService],
})
export class ReservationsModule {}