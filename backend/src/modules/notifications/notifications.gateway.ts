import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
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
  private connectedClients: Map<string, string> = new Map();

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

      const secret = this.configService.get<string>('JWT_SECRET');
      const payload = this.jwtService.verify(token, { secret });
      
      this.connectedClients.set(client.id, payload.sub);
      client.data.userId = payload.sub;
      
      this.logger.log(`User ${payload.sub} connected with socket ${client.id}`);
      client.join(`user:${payload.sub}`);
      client.emit('connected', { message: 'Connected to notification service' });
    } catch (error: any) {
      this.logger.error(`Connection error: ${error.message}`);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const userId = this.connectedClients.get(client.id);
    if (userId) {
      this.logger.log(`User ${userId} disconnected`);
      this.connectedClients.delete(client.id);
    }
  }

  sendNotificationToUser(userId: string, notification: NotificationPayload) {
    this.server.to(`user:${userId}`).emit('notification', notification);
    this.logger.log(`Notification sent to user ${userId}: ${notification.title}`);
  }

  sendNotificationToUsers(userIds: string[], notification: NotificationPayload) {
    userIds.forEach(userId => {
      this.server.to(`user:${userId}`).emit('notification', notification);
    });
    this.logger.log(`Notification sent to ${userIds.length} users`);
  }

  sendNotificationToAll(notification: NotificationPayload) {
    this.server.emit('notification', notification);
    this.logger.log(`Notification broadcasted to all clients`);
  }

  @SubscribeMessage('markAsRead')
  async handleMarkAsRead(client: Socket, payload: { notificationId: string }) {
    client.emit('notificationRead', { notificationId: payload.notificationId });
  }

  @SubscribeMessage('getUnreadCount')
  async handleGetUnreadCount(client: Socket) {
    client.emit('requestUnreadCount');
  }

  getConnectedClientsCount(): number {
    return this.connectedClients.size;
  }

  isUserConnected(userId: string): boolean {
    return Array.from(this.connectedClients.values()).includes(userId);
  }
}