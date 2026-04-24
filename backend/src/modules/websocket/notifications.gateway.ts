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
  server!: Server;

  private readonly logger = new Logger(NotificationsGateway.name);
  private connectedClients: Map<string, ConnectedClient[]> = new Map();

  handleConnection(client: Socket) {
    this.logger.log(`Client connecté: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client déconnecté: ${client.id}`);
    this.removeClient(client.id);
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

  sendNotificationToUser(userId: string, notification: any) {
    this.server.to(`user:${userId}`).emit('notification', notification);
    this.logger.log(`Notification sent to user ${userId}`);
  }

  sendNotificationToAll(notification: any) {
    this.server.emit('notification', notification);
    this.logger.log('Notification broadcast to all clients');
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