// backend/src/modules/services/services.service.ts

import { Injectable, NotFoundException, ForbiddenException, BadRequestException, Logger, Inject, forwardRef } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { UpsertLocationDto } from './dto/upsert-location.dto';
import { Service, ServiceDocument } from '../../database/schemas/service.schema';
import { User, UserDocument } from '../../database/schemas/user.schema';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class ServicesService {
  private readonly logger = new Logger(ServicesService.name);

  constructor(
    @InjectModel(Service.name) private serviceModel: Model<ServiceDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @Inject(forwardRef(() => NotificationsService))
    private notificationsService: NotificationsService,
  ) {}

  // ==================== CRUD POUR PROVIDER ====================

  async create(providerId: string, createServiceDto: CreateServiceDto): Promise<ServiceDocument> {
    const serviceData: any = {
      name: createServiceDto.name,
      description: createServiceDto.description,
      category: createServiceDto.category,
      providerId: new Types.ObjectId(providerId),
      isActive: false,
      isPendingApproval: true,
      images: createServiceDto.images || [],
      duration: createServiceDto.duration || 60,
    };

    if (createServiceDto.location) {
      serviceData.location = {
        type: 'Point',
        coordinates: [
          createServiceDto.location.coordinates.lng,
          createServiceDto.location.coordinates.lat,
        ] as [number, number],
        address: createServiceDto.location.address,
        city: createServiceDto.location.city,
        governorate: createServiceDto.location.governorate,
        postalCode: createServiceDto.location.postalCode,
      };
    }

    if (createServiceDto.slots) {
      serviceData.slots = createServiceDto.slots;
    }

    if (createServiceDto.openingHours) {
      serviceData.openingHours = createServiceDto.openingHours;
    }

    if (createServiceDto.cancellationPolicy) {
      serviceData.cancellationPolicy = createServiceDto.cancellationPolicy;
    }

    const service = new this.serviceModel(serviceData);
    await service.save();

    // 🔔 NOTIFICATION: Envoyer une notification aux admins
    await this.notifyAdminsNewService(service, providerId);

    return service;
  }

  // Nouvelle méthode pour notifier tous les admins
  private async notifyAdminsNewService(service: ServiceDocument, providerId: string) {
    try {
      // Récupérer tous les admins
      const admins = await this.userModel.find({ role: 'admin' }).exec();
      
      if (admins.length === 0) {
        this.logger.warn('Aucun admin trouvé pour la notification');
        return;
      }

      // Récupérer les infos du provider
      const provider = await this.userModel.findById(providerId).exec();
      const providerName = provider 
        ? `${provider.firstName} ${provider.lastName}` 
        : 'Un prestataire';

      this.logger.log(`Envoi de notification à ${admins.length} admin(s) pour le service ${service.name}`);

      // Créer une notification pour chaque admin
      for (const admin of admins) {
        await this.notificationsService.create(
          admin._id.toString(),
          'service_pending' as any,
          'Nouveau service à valider 🆕',
          `${providerName} a créé un nouveau service "${service.name}" qui nécessite votre validation.`,
          undefined,
          {
            serviceId: service._id.toString(),
            serviceName: service.name,
            providerId: providerId,
            providerName: providerName,
            actionUrl: `/admin/pending-services`,
          }
        );
      }

      this.logger.log(`Notification envoyée à ${admins.length} admin(s) pour le service ${service._id}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      this.logger.error(`Erreur lors de l'envoi de notification aux admins: ${errorMessage}`);
    }
  }

  // ✅ Provider peut modifier SES services
  async update(
    id: string,
    providerId: string,
    updateServiceDto: UpdateServiceDto,
  ): Promise<ServiceDocument> {
    const service = await this.findById(id);

    if (service.providerId.toString() !== providerId) {
      throw new ForbiddenException('Vous n\'êtes pas autorisé à modifier ce service');
    }

    if (updateServiceDto.location) {
      const location = updateServiceDto.location as any;
      if (location.coordinates && !Array.isArray(location.coordinates)) {
        updateServiceDto.location = {
          ...location,
          coordinates: [location.coordinates.lng, location.coordinates.lat],
        };
      }
    }

    Object.assign(service, updateServiceDto);

    if (updateServiceDto.name || updateServiceDto.description || updateServiceDto.location) {
      service.isPendingApproval = true;
      service.isActive = false;
    }

    return service.save();
  }

  // ✅ Provider peut supprimer SES services
  async delete(id: string, providerId: string): Promise<void> {
    const service = await this.findById(id);

    if (service.providerId.toString() !== providerId) {
      throw new ForbiddenException('Vous n\'êtes pas autorisé à supprimer ce service');
    }

    await this.serviceModel.findByIdAndDelete(id);
  }

  // ✅ Provider peut activer/désactiver SES services
  async toggleActive(id: string, providerId: string): Promise<ServiceDocument> {
    const service = await this.findById(id);

    if (service.providerId.toString() !== providerId) {
      throw new ForbiddenException('Vous n\'êtes pas autorisé à modifier ce service');
    }

    if (!service.isActive && service.isPendingApproval) {
      throw new BadRequestException('Ce service est en attente d\'approbation par un administrateur');
    }

    service.isActive = !service.isActive;
    return service.save();
  }

  // ✅ Provider peut modifier la localisation de SES services
  async updateLocation(
    id: string,
    providerId: string,
    dto: UpsertLocationDto,
  ): Promise<ServiceDocument> {
    const service = await this.serviceModel.findById(id).exec();

    if (!service) {
      throw new NotFoundException('Service non trouvé');
    }

    if (service.providerId.toString() !== providerId) {
      throw new ForbiddenException('Vous n\'êtes pas autorisé à modifier ce service');
    }

    service.location = {
      type: 'Point',
      coordinates: [
        dto.location.coordinates.lng,
        dto.location.coordinates.lat,
      ] as [number, number],
      address: dto.location.address,
      city: dto.location.city,
      governorate: dto.location.governorate,
      postalCode: dto.location.postalCode,
    };

    return service.save();
  }

  // ✅ Provider peut modifier les disponibilités de SES services
  async updateAvailability(
    id: string,
    providerId: string,
    data: {
      slots?: { duration: number; maxReservationsPerSlot: number }[];
      openingHours?: { [key: string]: { open: string; close: string } };
      duration?: number;
      cancellationPolicy?: { minHoursBefore: number; refundPercentage: number };
    },
  ): Promise<ServiceDocument> {
    const service = await this.findById(id);

    if (service.providerId.toString() !== providerId) {
      throw new ForbiddenException('Vous n\'êtes pas autorisé à modifier ce service');
    }

    if (data.slots !== undefined) {
      // Convertir les slots du frontend vers le format backend
      service.slots = data.slots.map(slot => ({
        duration: slot.duration || 60,
        maxReservationsPerSlot: slot.maxReservationsPerSlot || 1,
      }));
    }
    if (data.openingHours !== undefined) service.openingHours = data.openingHours;
    if (data.duration !== undefined) service.duration = data.duration;
    if (data.cancellationPolicy !== undefined) service.cancellationPolicy = data.cancellationPolicy;

    return service.save();
  }

  // ==================== MÉTHODES DE LECTURE ====================

  // ✅ Public - services actifs uniquement
  async findAll(query?: {
    category?: string;
    minRating?: number;
    limit?: number;
    skip?: number;
  }) {
    const filter: any = {
      isActive: true,
      isPendingApproval: false,
    };

    if (query?.category) filter.category = query.category;
    if (query?.minRating !== undefined) {
      filter.avgRating = { $gte: query.minRating };
    }

    const services = await this.serviceModel
      .find(filter)
      .sort({ smartScore: -1 })
      .limit(query?.limit || 50)
      .skip(query?.skip || 0)
      .populate('providerId', 'firstName lastName email providerProfile.businessName')
      .exec();

    const total = await this.serviceModel.countDocuments(filter);

    return { services, total };
  }

  async findById(id: string): Promise<ServiceDocument> {
    const service = await this.serviceModel
      .findById(id)
      .populate('providerId', 'firstName lastName email providerProfile.businessName phone')
      .exec();

    if (!service) {
      throw new NotFoundException('Service non trouvé');
    }

    return service;
  }

  // ✅ Provider - récupérer SES services
  async findByProvider(providerId: string): Promise<ServiceDocument[]> {
    try {
      const services = await this.serviceModel
        .find({ providerId: new Types.ObjectId(providerId) })
        .sort({ createdAt: -1 })
        .exec();
      
      console.log(`Found ${services.length} services for provider ${providerId}`);
      return services;
    } catch (error) {
      console.error('Error in findByProvider:', error);
      throw error;
    }
  }

  async findNearby(
    lng: number,
    lat: number,
    radius: number = 10,
    category?: string,
  ): Promise<ServiceDocument[]> {
    try {
      const filter: any = {
        isActive: true,
        isPendingApproval: false,
        location: {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [lng, lat],
            },
            $maxDistance: radius * 1000,
          },
        },
      };

      if (category && category !== '') {
        filter.category = category;
      }

      const services = await this.serviceModel
        .find(filter)
        .limit(50)
        .exec();

      return services;
    } catch (error) {
      console.error('Erreur findNearby:', error);
      return [];
    }
  }

  async searchByText(
    searchTerm: string,
    lng?: number,
    lat?: number,
    radius?: number,
    category?: string,
  ): Promise<ServiceDocument[]> {
    try {
      const filter: any = {
        isActive: true,
        isPendingApproval: false,
        $or: [
          { name: { $regex: searchTerm, $options: 'i' } },
          { description: { $regex: searchTerm, $options: 'i' } },
        ],
      };

      if (category && category !== '') {
        filter.category = category;
      }

      if (lng !== undefined && lat !== undefined && radius) {
        filter.location = {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [lng, lat],
            },
            $maxDistance: radius * 1000,
          },
        };
      }

      const services = await this.serviceModel
        .find(filter)
        .sort({ smartScore: -1 })
        .limit(50)
        .exec();

      return services;
    } catch (error) {
      console.error('Erreur searchByText:', error);
      return [];
    }
  }

  // ==================== MÉTHODES ADMIN ====================

  async findAllAdmin(): Promise<ServiceDocument[]> {
    return this.serviceModel
      .find()
      .populate('providerId', 'firstName lastName email providerProfile.businessName phone')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findPending(): Promise<ServiceDocument[]> {
    return this.serviceModel
      .find({
        isPendingApproval: true,
        isActive: false,
      })
      .populate('providerId', 'firstName lastName email providerProfile.businessName phone')
      .sort({ createdAt: 1 })
      .exec();
  }

  async getPendingCount(): Promise<number> {
    return this.serviceModel.countDocuments({
      isPendingApproval: true,
      isActive: false,
    });
  }

  async approveService(serviceId: string): Promise<ServiceDocument> {
    const service = await this.serviceModel.findByIdAndUpdate(
      serviceId,
      {
        isActive: true,
        isPendingApproval: false,
        rejectionReason: null,
      },
      { new: true },
    ).exec();

    if (!service) {
      throw new NotFoundException('Service non trouvé');
    }

    // 🔔 NOTIFICATION: Informer le provider que son service est approuvé
    await this.notifyProviderServiceApproved(service);

    return service;
  }

  async rejectService(serviceId: string, reason: string): Promise<ServiceDocument> {
    const service = await this.serviceModel.findByIdAndUpdate(
      serviceId,
      {
        isPendingApproval: false,
        isActive: false,
        rejectionReason: reason,
      },
      { new: true },
    ).exec();

    if (!service) {
      throw new NotFoundException('Service non trouvé');
    }

    // 🔔 NOTIFICATION: Informer le provider que son service est rejeté
    await this.notifyProviderServiceRejected(service, reason);

    return service;
  }

  // Nouvelle méthode pour notifier le provider d'une approbation
  private async notifyProviderServiceApproved(service: ServiceDocument) {
    try {
      const providerId = service.providerId.toString();
      const provider = await this.userModel.findById(providerId).exec();
      
      if (!provider) {
        this.logger.warn(`Provider ${providerId} non trouvé pour la notification d'approbation`);
        return;
      }

      await this.notificationsService.sendServiceApprovedToProvider(service, providerId);
      
      this.logger.log(`Notification d'approbation envoyée au provider ${providerId} pour le service ${service._id}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      this.logger.error(`Erreur lors de l'envoi de notification d'approbation: ${errorMessage}`);
    }
  }

  // Nouvelle méthode pour notifier le provider d'un rejet
  private async notifyProviderServiceRejected(service: ServiceDocument, reason: string) {
    try {
      const providerId = service.providerId.toString();
      const provider = await this.userModel.findById(providerId).exec();
      
      if (!provider) {
        this.logger.warn(`Provider ${providerId} non trouvé pour la notification de rejet`);
        return;
      }

      await this.notificationsService.sendServiceRejectedToProvider(service, providerId, reason);
      
      this.logger.log(`Notification de rejet envoyée au provider ${providerId} pour le service ${service._id}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      this.logger.error(`Erreur lors de l'envoi de notification de rejet: ${errorMessage}`);
    }
  }

  // ==================== MÉTHODES COMPATIBILITÉ ====================

  async upsertLocation(providerId: string, upsertLocationDto: UpsertLocationDto) {
    const existingService = await this.serviceModel.findOne({
      providerId: new Types.ObjectId(providerId),
    }).exec();

    if (!existingService) {
      throw new NotFoundException(
        'Aucun service trouvé pour ce prestataire. Veuillez d\'abord créer un service.',
      );
    }

    existingService.location = {
      type: 'Point',
      coordinates: [
        upsertLocationDto.location.coordinates.lng,
        upsertLocationDto.location.coordinates.lat,
      ] as [number, number],
      address: upsertLocationDto.location.address,
      city: upsertLocationDto.location.city,
      governorate: upsertLocationDto.location.governorate,
      postalCode: upsertLocationDto.location.postalCode,
    };

    await existingService.save();
    return {
      action: 'updated',
      service: existingService,
    };
  }

  async updateSmartScore(serviceId: string, score: number): Promise<void> {
    await this.serviceModel.findByIdAndUpdate(serviceId, { smartScore: score });
  }

  async incrementPopularity(serviceId: string): Promise<void> {
    await this.serviceModel.findByIdAndUpdate(serviceId, { $inc: { popularity: 1 } });
  }
}