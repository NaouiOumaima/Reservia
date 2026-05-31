import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { NotificationsService } from '../notifications/notifications.service';
import { Advertisement, AdvertisementDocument } from '../../database/schemas/advertisement.schema';

@Injectable()
export class AdvertisementsService {
  private readonly logger = new Logger(AdvertisementsService.name);

  constructor(
    @InjectModel(Advertisement.name) private adModel: Model<AdvertisementDocument>,
    @InjectModel('User') private userModel: Model<any>,
    private notificationsService: NotificationsService,
  ) {}

  async create(providerId: string, data: any): Promise<AdvertisementDocument> {
    this.logger.log(`Creating advertisement for provider ${providerId}`);
    
    const advertisement = new this.adModel({
      title: data.title,
      description: data.description,
      imageBase64: data.imageBase64,
      providerId: new Types.ObjectId(providerId),
      providerName: data.providerName,
      discountCode: data.discountCode,
      discountPercentage: data.discountPercentage,
      validUntil: data.validUntil ? new Date(data.validUntil) : undefined,
      status: 'active',
    });
    
    const saved = await advertisement.save();
    this.logger.log(`Advertisement created with ID: ${saved._id}`);
    return saved;
  }

  async findByProvider(providerId: string): Promise<any[]> {
    this.logger.log(`Finding ALL advertisements for provider ${providerId}`);
    
    // Récupérer TOUTES les annonces sans filtre
    const ads = await this.adModel
      .find({ providerId: new Types.ObjectId(providerId) })
      .sort({ createdAt: -1 })
      .lean()
      .exec();
    
    this.logger.log(`Found ${ads.length} total advertisements`);
    
    return ads.map(ad => ({
      ...ad,
      _id: ad._id.toString(),
      providerId: ad.providerId.toString(),
    }));
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