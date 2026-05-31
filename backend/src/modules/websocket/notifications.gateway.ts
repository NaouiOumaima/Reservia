// src/modules/websocket/notifications.gateway.ts
import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

interface NotificationPayload {
  id: string;
  type: string;
  title: string;
  message: string;
  imageUrl?: string;
  actionUrl?: string;
  discountCode?: string;
  discountPercentage?: number;
  createdAt: Date;
}

interface ConnectedClient {
  userId: string;
  socketId: string;
}

@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: true,
  },
  namespace: '/notifications',
})
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(NotificationsGateway.name);
  private connectedClients: Map<string, ConnectedClient[]> = new Map();
  private simpleConnectedClients: Map<string, string> = new Map();

  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth.token || client.handshake.headers.authorization?.split(' ')[1];
      
      if (!token) {
        this.logger.warn(`Client ${client.id} connected without token`);
        client.disconnect();
        return;
      }

      const secret = this.configService.get<string>('JWT_SECRET') || 'superSecretKey123!';
      const payload = this.jwtService.verify(token, { secret });
      
      const userId = payload.sub;
      this.simpleConnectedClients.set(client.id, userId);
      client.data.userId = userId;
      
      // Ajouter à la map des clients connectés
      this.addClient(userId, client.id);
      
      client.join(`user:${userId}`);
      client.emit('connected', { message: 'Connected to notification service' });
      
      this.logger.log(`✅ User ${userId} connected with socket ${client.id}`);
    } catch (error: any) {
      this.logger.error(`Connection error: ${error.message}`);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const userId = this.simpleConnectedClients.get(client.id);
    if (userId) {
      this.logger.log(`User ${userId} disconnected`);
      this.simpleConnectedClients.delete(client.id);
      this.removeClient(client.id);
    }
  }

  @SubscribeMessage('subscribe')
  handleSubscribe(@ConnectedSocket() client: Socket, @MessageBody() data: { userId: string }) {
    if (!data?.userId) return;

    this.addClient(data.userId, client.id);
    client.join(`user:${data.userId}`);
    this.logger.log(`User ${data.userId} subscribed to notifications`);

    client.emit('subscribed', { success: true });
  }

  @SubscribeMessage('unsubscribe')
  handleUnsubscribe(@ConnectedSocket() client: Socket, @MessageBody() data: { userId: string }) {
    if (!data?.userId) return;

    this.removeClient(client.id);
    client.leave(`user:${data.userId}`);
    this.logger.log(`User ${data.userId} unsubscribed`);

    client.emit('unsubscribed', { success: true });
  }

  @SubscribeMessage('markAsRead')
  async handleMarkAsRead(client: Socket, payload: { notificationId: string }) {
    client.emit('notificationRead', { notificationId: payload.notificationId });
  }

  @SubscribeMessage('getUnreadCount')
  async handleGetUnreadCount(client: Socket) {
    client.emit('requestUnreadCount');
  }

  // 🔥 Envoyer une notification classique
  sendNotificationToUser(userId: string, notification: NotificationPayload) {
    const payload = { ...notification, _id: notification.id };
    this.server.to(`user:${userId}`).emit('notification', payload);
    this.logger.log(`📨 Notification sent to user ${userId}: ${notification.title}`);
  }

  sendAdvertisementUpdateToUser(userId: string, advertisement: any) {
    const payload = {
      ...advertisement,
      _id: advertisement._id?.toString ? advertisement._id.toString() : advertisement._id || advertisement.id,
    };
    this.server.to(`user:${userId}`).emit('advertisement:update', payload);
    this.logger.log(`🔔 Advertisement status update sent to user ${userId}: ${payload._id}`);
  }

  sendNotificationToUsers(userIds: string[], notification: NotificationPayload) {
    const payload = { ...notification, _id: notification.id };
    userIds.forEach(userId => {
      this.server.to(`user:${userId}`).emit('notification', payload);
    });
    this.logger.log(`📨 Notification sent to ${userIds.length} users`);
  }

  sendNotificationToAll(notification: NotificationPayload) {
    this.server.emit('notification', notification);
    this.logger.log(`📨 Notification broadcasted to all clients`);
  }

  // 🔥 Envoyer une mise à jour des réservations
  sendReservationUpdateToUser(userId: string, data: any) {
    this.server.to(`user:${userId}`).emit('reservations_updated', {
      type: 'reservations_updated',
      data,
      timestamp: new Date()
    });
    this.logger.log(`🔄 Reservation update sent to user ${userId}`);
  }

  sendReservationUpdateToProvider(providerId: string, reservation: any) {
    this.sendReservationUpdateToUser(providerId, { action: 'reservation_updated', reservation });
  }

  sendReservationUpdateToClient(clientId: string, reservation: any) {
    this.sendReservationUpdateToUser(clientId, { action: 'reservation_updated', reservation });
  }

  getConnectedClientsCount(): number {
    return this.simpleConnectedClients.size;
  }

  isUserConnected(userId: string): boolean {
    return Array.from(this.simpleConnectedClients.values()).includes(userId);
  }

  private addClient(userId: string, socketId: string) {
    const clients = this.connectedClients.get(userId) || [];
    clients.push({ userId, socketId });
    this.connectedClients.set(userId, clients);
  }

  private removeClient(socketId: string) {
    for (const [userId, clients] of this.connectedClients.entries()) {
      const filtered = clients.filter(c => c.socketId !== socketId);
      if (filtered.length === 0) {
        this.connectedClients.delete(userId);
      } else {
        this.connectedClients.set(userId, filtered);
      }
    }
  }
}