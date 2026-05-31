// backend/src/modules/advertisements/advertisements.service.ts
import {
  Injectable,
  NotFoundException,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationsGateway } from '../websocket/notifications.gateway';
import {
  Advertisement,
  AdvertisementDocument,
} from '../../database/schemas/advertisement.schema';

@Injectable()
export class AdvertisementsService implements OnModuleInit, OnModuleDestroy {
  private expirationInterval?: NodeJS.Timeout;
  private readonly logger = new Logger(AdvertisementsService.name);

  constructor(
    @InjectModel(Advertisement.name)
    private adModel: Model<AdvertisementDocument>,
    @InjectModel('User') private userModel: Model<any>,
    private notificationsService: NotificationsService,
    private notificationsGateway: NotificationsGateway,
  ) {}

  onModuleInit() {
    // On lance une première vérification immédiate au démarrage
    this.expireAdvertisements().catch((error) => {
      this.logger.error(
        'Erreur lors de la vérification initiale des annonces expirées',
        error,
      );
    });

    // Puis on vérifie toutes les 60 secondes
    this.expirationInterval = setInterval(() => {
      this.expireAdvertisements().catch((error) => {
        this.logger.error(
          'Erreur lors de la vérification des annonces expirées',
          error,
        );
      });
    }, 60_000);
  }

  onModuleDestroy() {
    if (this.expirationInterval) {
      clearInterval(this.expirationInterval);
    }
  }

  async create(
    providerId: string,
    data: any,
  ): Promise<AdvertisementDocument> {
    const advertisement = new this.adModel({
      ...data,
      providerId: new Types.ObjectId(providerId),
      status: 'active',
    });
    const saved = await advertisement.save();
    return saved;
  }

  async sendNotificationsToTarget(
    advertisement: AdvertisementDocument,
  ): Promise<void> {
    try {
      const ad = advertisement as any;
      const adId = ad._id;

      if (!adId) {
        this.logger.error('Advertisement ID not found');
        return;
      }

      const clients = await this.userModel
        .find({ role: 'client' })
        .select('_id')
        .exec();

      if (!clients || clients.length === 0) {
        this.logger.log('No clients found to send notifications');
        return;
      }

      this.logger.log(
        `📢 Sending notifications to ${clients.length} clients for advertisement: ${advertisement.title}`,
      );

      let sentCount = 0;
      for (const client of clients) {
        try {
          await this.notificationsService.sendAdvertisementNotification(
            client._id.toString(),
            {
              title: advertisement.title,
              message: advertisement.description,
              advertisementId: adId.toString(),
              imageUrl: advertisement.imageUrl,
              actionUrl: `/ads/${adId}`,
              discountCode: advertisement.discountCode,
              discountPercentage: advertisement.discountPercentage,
            },
          );
          sentCount++;
        } catch (err) {
          this.logger.error(
            `Failed to send notification to client ${client._id}:`,
            err,
          );
        }
      }

      this.logger.log(
        `✅ Successfully sent ${sentCount} notifications out of ${clients.length} clients`,
      );
    } catch (error) {
      this.logger.error('Error sending notifications:', error);
    }
  }

  async findByProvider(
    providerId: string,
    status?: string,
  ): Promise<AdvertisementDocument[]> {
    // On expire d'abord les annonces actives périmées pour ce provider
    await this.expireAdvertisementsForProvider(providerId);

    const query: any = { providerId: new Types.ObjectId(providerId) };
    if (status) {
      query.status = status;
    }

    return this.adModel.find(query).sort({ createdAt: -1 }).exec();
  }

  async expireAdvertisementsForProvider(providerId: string): Promise<void> {
    const now = new Date();
    const expiredAds = await this.adModel
      .find({
        providerId: new Types.ObjectId(providerId),
        status: 'active',
        validUntil: { $lte: now },
      })
      .exec();

    if (!expiredAds.length) return;

    const ids = expiredAds.map((ad) => ad._id);
    await this.adModel
      .updateMany({ _id: { $in: ids } }, { status: 'inactive' })
      .exec();

    this.logger.log(
      `⏰ Expired ${expiredAds.length} ads for provider ${providerId}`,
    );

    // Émettre un événement socket pour chaque annonce expirée
    expiredAds.forEach((ad) => {
      const updatedAd = { ...ad.toObject(), status: 'inactive' };
      this.notificationsGateway.sendAdvertisementUpdateToUser(
        ad.providerId.toString(),
        updatedAd,
      );
    });
  }

  /**
   * Vérifie TOUTES les annonces actives expirées (appelé par le setInterval global).
   * Met à jour le statut en base et notifie chaque provider via socket.io.
   * Pas de polling frontend — le provider reçoit la mise à jour en temps réel.
   */
  async expireAdvertisements(): Promise<void> {
    const now = new Date();
    const expiredAds = await this.adModel
      .find({ status: 'active', validUntil: { $lte: now } })
      .exec();

    if (!expiredAds.length) return;

    const ids = expiredAds.map((ad) => ad._id);
    await this.adModel
      .updateMany({ _id: { $in: ids } }, { status: 'inactive' })
      .exec();

    this.logger.log(
      `⏰ Global expiration: ${expiredAds.length} ads marked inactive`,
    );

    // Regrouper par provider pour n'émettre qu'une fois par provider si besoin
    // Mais on émet par annonce pour que le frontend puisse mettre à jour
    // chaque carte individuellement
    expiredAds.forEach((ad) => {
      const updatedAd = { ...ad.toObject(), status: 'inactive' };
      // Émet l'événement "advertisement:update" dans la room du provider
      this.notificationsGateway.sendAdvertisementUpdateToUser(
        ad.providerId.toString(),
        updatedAd,
      );
    });
  }

  async archive(
    id: string,
    providerId: string,
  ): Promise<AdvertisementDocument> {
    const advertisement = await this.adModel
      .findOneAndUpdate(
        {
          _id: new Types.ObjectId(id),
          providerId: new Types.ObjectId(providerId),
        },
        { status: 'archived' },
        { new: true },
      )
      .exec();

    if (!advertisement) {
      throw new NotFoundException('Annonce non trouvée');
    }

    // Notifier le provider via socket que le statut a changé
    this.notificationsGateway.sendAdvertisementUpdateToUser(
      providerId,
      advertisement.toObject(),
    );

    return advertisement;
  }

  async unarchive(
    id: string,
    providerId: string,
  ): Promise<AdvertisementDocument> {
    const advertisement = await this.adModel
      .findOneAndUpdate(
        {
          _id: new Types.ObjectId(id),
          providerId: new Types.ObjectId(providerId),
        },
        { status: 'active' },
        { new: true },
      )
      .exec();

    if (!advertisement) {
      throw new NotFoundException('Annonce non trouvée');
    }

    // Notifier le provider via socket que le statut a changé
    this.notificationsGateway.sendAdvertisementUpdateToUser(
      providerId,
      advertisement.toObject(),
    );

    return advertisement;
  }

  async findById(
    id: string,
    userId?: string,
  ): Promise<AdvertisementDocument> {
    const ad = await this.adModel.findById(id).exec();
    if (!ad) throw new NotFoundException('Annonce non trouvée');

    ad.viewsCount += 1;
    if (userId && !ad.viewedBy.some((v) => v.userId === userId)) {
      ad.viewedBy.push({ userId, viewedAt: new Date() });
    }
    await ad.save();

    return ad;
  }

  async delete(id: string, providerId: string): Promise<void> {
    const result = await this.adModel.findOneAndDelete({
      _id: new Types.ObjectId(id),
      providerId: new Types.ObjectId(providerId),
    });
    if (!result) throw new NotFoundException('Annonce non trouvée');
  }
}