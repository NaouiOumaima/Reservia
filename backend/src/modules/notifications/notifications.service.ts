// backend/src/modules/notifications/notifications.service.ts

import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Notification, NotificationDocument, NotificationType } from '../../database/schemas/notification.schema';
import { Advertisement, AdvertisementDocument } from '../../database/schemas/advertisement.schema';
import { NotificationsGateway } from '../websocket/notifications.gateway';
import { User, UserDocument } from '../../database/schemas/user.schema';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    @InjectModel(Notification.name) private notificationModel: Model<NotificationDocument>,
    @InjectModel(Advertisement.name) private advertisementModel: Model<AdvertisementDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private notificationsGateway: NotificationsGateway,
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

    this.notificationsGateway.sendNotificationToUser(userId, {
      id: notification._id.toString(),
      type,
      title,
      message,
      createdAt: (notification as any).createdAt || new Date(),
    });

    return notification;
  }

  async sendAdvertisementNotification(
    userId: string,
    data: {
      title: string;
      message: string;
      advertisementId: string;
      imageUrl?: string;
      actionUrl?: string;
      discountCode?: string;
      discountPercentage?: number;
    }
  ) {
    const notification = new this.notificationModel({
      userId: new Types.ObjectId(userId),
      type: NotificationType.ADVERTISEMENT,
      title: `📢 ${data.title}`,
      message: data.message,
      advertisementId: new Types.ObjectId(data.advertisementId),
      data: {
        advertisementId: data.advertisementId,
        imageUrl: data.imageUrl,
        actionUrl: data.actionUrl,
        discountCode: data.discountCode,
        discountPercentage: data.discountPercentage,
      },
      imageUrl: data.imageUrl,
      actionUrl: data.actionUrl,
      isRead: false,
      channels: ['in_app'],
    });

    await notification.save();

    this.notificationsGateway.sendNotificationToUser(userId, {
      id: notification._id.toString(),
      type: NotificationType.ADVERTISEMENT,
      title: notification.title,
      message: notification.message,
      imageUrl: data.imageUrl,
      actionUrl: data.actionUrl,
      discountCode: data.discountCode,
      discountPercentage: data.discountPercentage,
      createdAt: (notification as any).createdAt || new Date(),
    });

    return notification;
  }

  async sendBulkAdvertisementNotifications(
    userIds: string[],
    data: {
      title: string;
      message: string;
      advertisementId: string;
      imageUrl?: string;
      actionUrl?: string;
      discountCode?: string;
      discountPercentage?: number;
    }
  ): Promise<number> {
    const notifications = userIds.map(userId => ({
      userId: new Types.ObjectId(userId),
      type: NotificationType.ADVERTISEMENT,
      title: `📢 ${data.title}`,
      message: data.message,
      advertisementId: new Types.ObjectId(data.advertisementId),
      data: {
        advertisementId: data.advertisementId,
        imageUrl: data.imageUrl,
        actionUrl: data.actionUrl,
        discountCode: data.discountCode,
        discountPercentage: data.discountPercentage,
      },
      imageUrl: data.imageUrl,
      actionUrl: data.actionUrl,
      isRead: false,
      channels: ['in_app'],
    }));

    const result = await this.notificationModel.insertMany(notifications);
    
    result.forEach((notificationDoc, index) => {
      const userId = userIds[index];
      if (!userId) return;
      this.notificationsGateway.sendNotificationToUser(userId, {
        id: notificationDoc._id.toString(),
        type: NotificationType.ADVERTISEMENT,
        title: data.title,
        message: data.message,
        imageUrl: data.imageUrl,
        actionUrl: data.actionUrl,
        discountCode: data.discountCode,
        discountPercentage: data.discountPercentage,
        createdAt: (notificationDoc as any).createdAt || new Date(),
      });
    });

    return result.length;
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
      `Votre réservation pour ${serviceName} a expiré`,
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

  async findByUserIdWithPagination(
    userId: string, 
    page: number = 1, 
    limit: number = 20,
    unreadOnly: boolean = false
  ) {
    const skip = (page - 1) * limit;
    const query: any = { userId: new Types.ObjectId(userId) };
    if (unreadOnly) query.isRead = false;

    const [notifications, total] = await Promise.all([
      this.notificationModel
        .find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.notificationModel.countDocuments(query),
    ]);

    return {
      notifications,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      hasMore: skip + limit < total,
    };
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

  async deleteNotification(notificationId: string, userId: string) {
    const result = await this.notificationModel.findOneAndDelete({
      _id: notificationId,
      userId: new Types.ObjectId(userId),
    });
    
    if (!result) {
      throw new NotFoundException('Notification non trouvée');
    }
    
    return result;
  }

  async deleteAllReadNotifications(userId: string) {
    return this.notificationModel.deleteMany({
      userId: new Types.ObjectId(userId),
      isRead: true,
    });
  }

  async sendServicePendingToAdmins(service: any, provider: any) {
    try {
      const admins = await this.userModel.find({ role: 'admin' }).exec();
      
      if (admins.length === 0) {
        this.logger.warn('Aucun admin trouvé pour la notification');
        return;
      }

      this.logger.log(`Envoi de notification à ${admins.length} admin(s) pour le service ${service.name}`);

      for (const admin of admins) {
        await this.create(
          admin._id.toString(),
          'service_pending' as any,
          'Nouveau service à valider 🆕',
          `${provider.firstName} ${provider.lastName} a créé "${service.name}" qui nécessite votre validation.`,
          undefined,
          {
            serviceId: service._id.toString(),
            serviceName: service.name,
            providerId: provider._id.toString(),
            providerName: `${provider.firstName} ${provider.lastName}`,
            actionUrl: `/admin/pending-services`,
          }
        );
      }
    } catch (error) {
      // ✅ Correction: Typer l'erreur correctement
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      this.logger.error(`Erreur lors de l'envoi de notification aux admins: ${errorMessage}`);
    }
  }

  async sendServiceApprovedToProvider(service: any, providerId: string) {
    try {
      await this.create(
        providerId,
        'service_approved' as any,
        'Service approuvé ✅',
        `Votre service "${service.name}" a été approuvé et est maintenant visible par les clients.`,
        undefined,
        {
          serviceId: service._id.toString(),
          serviceName: service.name,
          actionUrl: `/provider/services`,
        }
      );
      this.logger.log(`Notification d'approbation envoyée au provider ${providerId}`);
    } catch (error) {
      // ✅ Correction: Typer l'erreur correctement
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      this.logger.error(`Erreur lors de l'envoi de notification d'approbation: ${errorMessage}`);
    }
  }

  async sendServiceRejectedToProvider(service: any, providerId: string, reason: string) {
    try {
      await this.create(
        providerId,
        'service_rejected' as any,
        'Service refusé ❌',
        `Votre service "${service.name}" a été refusé. Raison: ${reason}`,
        undefined,
        {
          serviceId: service._id.toString(),
          serviceName: service.name,
          rejectionReason: reason,
          actionUrl: `/provider/services`,
        }
      );
      this.logger.log(`Notification de rejet envoyée au provider ${providerId}`);
    } catch (error) {
      // ✅ Correction: Typer l'erreur correctement
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      this.logger.error(`Erreur lors de l'envoi de notification de rejet: ${errorMessage}`);
    }
  }
}