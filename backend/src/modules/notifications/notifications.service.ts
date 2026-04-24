// src/modules/notifications/notifications.service.ts

import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { Notification, NotificationDocument, NotificationType } from '../../database/schemas/notification.schema';
import { NotificationsGateway } from '../websocket/notifications.gateway';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    @InjectModel(Notification.name) private notificationModel: Model<NotificationDocument>,
    private notificationsGateway: NotificationsGateway,
    private configService: ConfigService,
  ) {}

  async create(
    userId: string,
    type: NotificationType,
    title: string,
    message: string,
    reservationId?: string,
    data?: any,
  ) {
    const notification = new this.notificationModel({
      userId: new Types.ObjectId(userId),
      type,
      title,
      message,
      reservationId: reservationId ? new Types.ObjectId(reservationId) : undefined,
      data,
      isRead: false,
      channels: ['in_app'],
    });

    await notification.save();

    // Envoyer en temps réel via WebSocket
    this.notificationsGateway.sendNotificationToUser(userId, {
      id: notification._id,
      type,
      title,
      message,
createdAt: (notification as any).createdAt || new Date(),
    });

    return notification;
  }

  async sendReservationConfirmation(userId: string, reservation: any) {
    const serviceName = reservation.service?.name || 'Service';
    const startTime = new Date(reservation.startTime).toLocaleString('fr-FR');

    return this.create(
      userId,
      NotificationType.RESERVATION_CONFIRMED,
      'Réservation confirmée ✅',
      `Votre réservation pour ${serviceName} est confirmée pour le ${startTime}`,
      reservation._id,
      { startTime, serviceName },
    );
  }

  async sendReservationReminder(userId: string, reservation: any, hoursBefore: number = 2) {
    const serviceName = reservation.service?.name || 'Service';
    const startTime = new Date(reservation.startTime).toLocaleString('fr-FR');

    return this.create(
      userId,
      NotificationType.RESERVATION_REMINDER,
      `Rappel: Rendez-vous dans ${hoursBefore}h`,
      `Votre réservation pour ${serviceName} est prévue le ${startTime}`,
      reservation._id,
      { startTime, serviceName, hoursBefore },
    );
  }

  async sendReservationCancellation(userId: string, reservation: any) {
    const serviceName = reservation.service?.name || 'Service';

    return this.create(
      userId,
      NotificationType.RESERVATION_CANCELLED,
      'Réservation annulée ❌',
      `Votre réservation pour ${serviceName} a été annulée`,
      reservation._id,
      { serviceName },
    );
  }

  async sendExpirationWarning(userId: string, reservation: any) {
    const serviceName = reservation.service?.name || 'Service';

    return this.create(
      userId,
      NotificationType.RESERVATION_EXPIRED,
      'Réservation expirée ⏰',
      `Votre réservation pour ${serviceName} a expiré car elle n'a pas été confirmée à temps`,
      reservation._id,
      { serviceName },
    );
  }

  async findByUserId(userId: string, unreadOnly: boolean = false, limit: number = 50) {
    const query: any = { userId: new Types.ObjectId(userId) };
    if (unreadOnly) query.isRead = false;

    return this.notificationModel
      .find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();
  }

  async markAsRead(notificationId: string, userId: string) {
    return this.notificationModel.findOneAndUpdate(
      { _id: notificationId, userId: new Types.ObjectId(userId) },
      { isRead: true },
      { new: true },
    );
  }

  async markAllAsRead(userId: string) {
    return this.notificationModel.updateMany(
      { userId: new Types.ObjectId(userId), isRead: false },
      { isRead: true },
    );
  }

  async getUnreadCount(userId: string) {
    return this.notificationModel.countDocuments({
      userId: new Types.ObjectId(userId),
      isRead: false,
    });
  }
}