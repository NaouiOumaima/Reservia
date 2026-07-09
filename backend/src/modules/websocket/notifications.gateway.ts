// src/modules/websocket/notifications.gateway.ts

import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: true,
  },
  namespace: '/notifications',
})
export class NotificationsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(NotificationsGateway.name);

  constructor(private readonly jwtService: JwtService) {}

  handleConnection(client: Socket) {
    const token = client.handshake.auth?.token as string | undefined;
    if (!token) {
      this.logger.log(`Client connecté sans token: ${client.id}`);
      return;
    }

    try {
      const payload = this.jwtService.verify(token);
      const userId = payload.sub || payload._id || payload.id;
      if (userId) {
        client.data.userId = userId;
        void client.join(`user:${userId}`);
        this.logger.log(`User ${userId} connecté et rejoint sa room`);
      }
    } catch {
      this.logger.warn(`Token socket invalide pour ${client.id}`);
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client déconnecté: ${client.id}`);
  }

  // Conservé en fallback pour compatibilité, le join se fait normalement
  // automatiquement à la connexion via le token d'authentification.
  @SubscribeMessage('subscribe')
  handleSubscribe(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { userId: string },
  ) {
    if (!data?.userId) return;

    void client.join(`user:${data.userId}`);
    client.emit('subscribed', { success: true });
  }

  @SubscribeMessage('unsubscribe')
  handleUnsubscribe(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { userId: string },
  ) {
    if (!data?.userId) return;

    void client.leave(`user:${data.userId}`);
    client.emit('unsubscribed', { success: true });
  }

  sendNotificationToUser(userId: string, notification: any) {
    this.server.to(`user:${userId}`).emit('new_notification', notification);
    this.logger.log(`Notification envoyée à ${userId}`);
  }

  sendNotificationToAll(notification: any) {
    this.server.emit('new_notification', notification);
    this.logger.log('Notification diffusée à tous les clients');
  }

  emitNotificationRead(userId: string, notificationId: string) {
    this.server.to(`user:${userId}`).emit('notification_read', {
      notificationId,
    });
  }

  emitAllNotificationsRead(userId: string) {
    this.server.to(`user:${userId}`).emit('all_notifications_read', {});
  }

  emitNotificationDeleted(userId: string, notificationId: string) {
    this.server.to(`user:${userId}`).emit('notification_deleted', {
      notificationId,
    });
  }

  emitReservationUpdate(userId: string, reservation: any) {
    this.server.to(`user:${userId}`).emit('reservation_updated', reservation);
  }
}
