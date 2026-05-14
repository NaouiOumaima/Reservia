// backend/src/modules/advertisements/advertisements.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { NotificationsService } from '../notifications/notifications.service';
import { Advertisement, AdvertisementDocument } from '../../database/schemas/advertisement.schema';

@Injectable()
export class AdvertisementsService {
  constructor(
    @InjectModel(Advertisement.name) private adModel: Model<AdvertisementDocument>,
    @InjectModel('User') private userModel: Model<any>, // ✅ Injecter le modèle User
    private notificationsService: NotificationsService,
  ) {}

  async create(providerId: string, data: any): Promise<AdvertisementDocument> {
    const advertisement = new this.adModel({
      ...data,
      providerId: new Types.ObjectId(providerId),
      status: 'active',
    });
    const saved = await advertisement.save();
    return saved;
  }

  async sendNotificationsToTarget(advertisement: AdvertisementDocument): Promise<void> {
    try {
      const ad = advertisement as any;
      const adId = ad._id;
      
      if (!adId) {
        console.error('Advertisement ID not found');
        return;
      }
      
      // ✅ Récupérer TOUS les clients de la base de données
      const clients = await this.userModel.find({ role: 'client' }).select('_id').exec();
      
      if (!clients || clients.length === 0) {
        console.log('No clients found to send notifications');
        return;
      }
      
      console.log(`📢 Sending notifications to ${clients.length} clients for advertisement: ${advertisement.title}`);
      
      // Envoyer les notifications à chaque client
      let sentCount = 0;
      for (const client of clients) {
        try {
          await this.notificationsService.sendAdvertisementNotification(client._id.toString(), {
            title: advertisement.title,
            message: advertisement.description,
            advertisementId: adId.toString(),
            imageUrl: advertisement.imageUrl,
            actionUrl: `/ads/${adId}`,
            discountCode: advertisement.discountCode,
            discountPercentage: advertisement.discountPercentage,
          });
          sentCount++;
        } catch (err) {
          console.error(`Failed to send notification to client ${client._id}:`, err);
        }
      }
      
      console.log(`✅ Successfully sent ${sentCount} notifications out of ${clients.length} clients`);
    } catch (error) {
      console.error('Error sending notifications:', error);
    }
  }

  async findByProvider(providerId: string): Promise<AdvertisementDocument[]> {
    return this.adModel
      .find({ providerId: new Types.ObjectId(providerId) })
      .sort({ createdAt: -1 })
      .exec();
  }

  async findById(id: string, userId?: string): Promise<AdvertisementDocument> {
    const ad = await this.adModel.findById(id).exec();
    if (!ad) throw new NotFoundException('Annonce non trouvée');
    
    ad.viewsCount += 1;
    if (userId && !ad.viewedBy.some(v => v.userId === userId)) {
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