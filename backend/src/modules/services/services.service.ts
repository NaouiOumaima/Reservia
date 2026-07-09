// src/modules/services/services.service.ts

import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  Service,
  ServiceDocument,
  ServiceCategory,
  ServiceStatus,
} from '../../database/schemas/service.schema';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { UpsertLocationDto } from './dto/upsert-location.dto';

@Injectable()
export class ServicesService {
  constructor(
    @InjectModel(Service.name) private serviceModel: Model<ServiceDocument>,
  ) {}

  async create(providerId: string, createServiceDto: CreateServiceDto) {
    const service = new this.serviceModel({
      ...createServiceDto,
      providerId: new Types.ObjectId(providerId),
      location: {
        type: 'Point',
        coordinates: createServiceDto.location.coordinates as [number, number],
        address: createServiceDto.location.address,
        city: createServiceDto.location.city,
        governorate: createServiceDto.location.governorate,
        postalCode: createServiceDto.location.postalCode,
      },
    });

    return service.save();
  }

  async upsertLocation(
    providerId: string,
    upsertLocationDto: UpsertLocationDto,
  ) {
    const existingService = await this.serviceModel
      .findOne({
        providerId: new Types.ObjectId(providerId),
      })
      .exec();

    const coordinates: [number, number] = [
      upsertLocationDto.location.coordinates.lng,
      upsertLocationDto.location.coordinates.lat,
    ];

    const locationData = {
      type: 'Point',
      coordinates,
      address: upsertLocationDto.location.address,
      city: upsertLocationDto.location.city,
      governorate: upsertLocationDto.location.governorate,
      postalCode: upsertLocationDto.location.postalCode,
    };

    if (existingService) {
      existingService.location = locationData;
      await existingService.save();
      return { action: 'updated', service: existingService };
    } else {
      const newService = new this.serviceModel({
        providerId: new Types.ObjectId(providerId),
        name: 'Mon Service',
        category: ServiceCategory.OTHER,
        description: 'Service créé via la localisation',
        duration: 60,
        location: locationData,
        status: ServiceStatus.PENDING_APPROVAL,
      });
      await newService.save();
      return { action: 'created', service: newService };
    }
  }

  async findAll(query?: {
    category?: ServiceCategory;
    minRating?: number;
    limit?: number;
    skip?: number;
  }) {
    const filter: any = { status: ServiceStatus.ACTIVE };

    if (query?.category) filter.category = query.category;
    if (query?.minRating !== undefined)
      filter.avgRating = { $gte: query.minRating };

    const services = await this.serviceModel
      .find(filter)
      .sort({ smartScore: -1 })
      .limit(query?.limit || 50)
      .skip(query?.skip || 0)
      .populate(
        'providerId',
        'firstName lastName email providerProfile.businessName',
      )
      .exec();

    const total = await this.serviceModel.countDocuments(filter);

    return { services, total };
  }

  async findById(id: string, requesterId?: string, isAdmin: boolean = false) {
    const service = await this.serviceModel
      .findById(id)
      .populate(
        'providerId',
        'firstName lastName email providerProfile.businessName phone',
      )
      .exec();

    if (!service) {
      throw new NotFoundException('Service non trouvé');
    }

    const isOwner =
      !!requesterId && service.providerId.toString() === requesterId;

    if (service.status !== ServiceStatus.ACTIVE && !isOwner && !isAdmin) {
      // Ne pas laisser fuiter l'existence d'un service non actif à un tiers
      throw new NotFoundException('Service non trouvé');
    }

    return service;
  }

  async findByProvider(providerId: string) {
    return this.serviceModel
      .find({ providerId: new Types.ObjectId(providerId) })
      .sort({ createdAt: -1 })
      .exec();
  }

  async findNearby(lng: number, lat: number, radius: number = 10) {
  try {
    const filter = {
      status: ServiceStatus.ACTIVE,
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [lng, lat],
          },
          $maxDistance: radius * 1000, // km -> m
        },
      },
    };

    const services = await this.serviceModel
      .find(filter)
      .limit(50)
      .exec();

    // Log utile pour debug : si count total ACTIVE = 0, le souci est le statut,
    // pas la géo.
    if (services.length === 0) {
      const totalActive = await this.serviceModel.countDocuments({
        status: ServiceStatus.ACTIVE,
      });
      console.warn(
        `[findNearby] 0 résultat pour lng=${lng} lat=${lat} radius=${radius}km. ` +
        `Total services ACTIVE en base: ${totalActive}.`,
      );
    }

    return services;
  } catch (error) {
    // Avant on retournait [] en silence -> impossible à diagnostiquer côté front.
    // On log l'erreur complète (souvent: index 2dsphere manquant sur `location`).
    console.error('Erreur findNearby:', error);
    throw new BadRequestException(
      'Erreur lors de la recherche géographique. Vérifiez que le champ location possède un index 2dsphere.',
    );
  }
}
  async update(
    id: string,
    providerId: string,
    updateServiceDto: UpdateServiceDto,
  ) {
    const service = await this.serviceModel.findById(id).exec();

    if (!service) {
      throw new NotFoundException('Service non trouvé');
    }

    if (service.providerId.toString() !== providerId.toString()) {
      throw new ForbiddenException(
        "Vous n'êtes pas autorisé à modifier ce service",
      );
    }

    if (updateServiceDto.location) {
      const location = updateServiceDto.location as any;
      if (location.coordinates && Array.isArray(location.coordinates)) {
        location.coordinates = [
          location.coordinates[0],
          location.coordinates[1],
        ] as [number, number];
      }
    }

    // Le statut ne se change que via toggleStatus/approve/reject/ban, jamais
    // via cette mise à jour générique du provider.
    const {
      status: _status,
      rejectionReason: _rejectionReason,
      banReason: _banReason,
      ...safeUpdate
    } = updateServiceDto as any;

    Object.assign(service, safeUpdate);
    return service.save();
  }

  async delete(id: string, providerId: string) {
    await this.findOwnedByProvider(id, providerId);
    return this.serviceModel.findByIdAndDelete(id);
  }

  // Bascule ACTIVE <-> DISABLED. Sert aussi de "renouvellement" d'un
  // service désactivé par le provider (pas de re-validation admin requise).
  async toggleStatus(id: string, providerId: string) {
    const service = await this.findOwnedByProvider(id, providerId);

    if (service.status === ServiceStatus.BANNED) {
      throw new ForbiddenException(
        'Ce service a été banni par un administrateur',
      );
    }
    if (service.status === ServiceStatus.PENDING_APPROVAL) {
      throw new BadRequestException(
        'Ce service est en attente de validation par un administrateur',
      );
    }

    service.status =
      service.status === ServiceStatus.ACTIVE
        ? ServiceStatus.DISABLED
        : ServiceStatus.ACTIVE;
    return service.save();
  }

  private async findOwnedByProvider(id: string, providerId: string) {
    const service = await this.serviceModel.findById(id).exec();
    if (!service) {
      throw new NotFoundException('Service non trouvé');
    }
    if (service.providerId.toString() !== providerId) {
      throw new ForbiddenException(
        "Vous n'êtes pas autorisé à modifier ce service",
      );
    }
    return service;
  }

  async updateSmartScore(serviceId: string, score: number) {
    return this.serviceModel.findByIdAndUpdate(serviceId, {
      smartScore: score,
    });
  }

  async incrementPopularity(serviceId: string) {
    return this.serviceModel.findByIdAndUpdate(serviceId, {
      $inc: { popularity: 1 },
    });
  }

  // ==================== ADMIN ====================

  async findAllAdmin(): Promise<ServiceDocument[]> {
    return this.serviceModel
      .find()
      .populate(
        'providerId',
        'firstName lastName email providerProfile.businessName phone',
      )
      .sort({ createdAt: -1 })
      .exec();
  }

  async findPending(): Promise<ServiceDocument[]> {
    return this.serviceModel
      .find({ status: ServiceStatus.PENDING_APPROVAL })
      .populate(
        'providerId',
        'firstName lastName email providerProfile.businessName phone',
      )
      .sort({ createdAt: 1 })
      .exec();
  }

  async approveService(serviceId: string): Promise<ServiceDocument> {
    const service = await this.serviceModel
      .findByIdAndUpdate(
        serviceId,
        { status: ServiceStatus.ACTIVE, rejectionReason: null },
        { new: true },
      )
      .exec();

    if (!service) throw new NotFoundException('Service non trouvé');
    return service;
  }

  async rejectService(
    serviceId: string,
    reason: string,
  ): Promise<ServiceDocument> {
    const service = await this.serviceModel
      .findByIdAndUpdate(
        serviceId,
        { status: ServiceStatus.DISABLED, rejectionReason: reason },
        { new: true },
      )
      .exec();

    if (!service) throw new NotFoundException('Service non trouvé');
    return service;
  }

  async banService(
    serviceId: string,
    reason: string,
  ): Promise<ServiceDocument> {
    const service = await this.serviceModel
      .findByIdAndUpdate(
        serviceId,
        { status: ServiceStatus.BANNED, banReason: reason },
        { new: true },
      )
      .exec();

    if (!service) throw new NotFoundException('Service non trouvé');
    return service;
  }

  async unbanService(serviceId: string): Promise<ServiceDocument> {
    const service = await this.serviceModel
      .findByIdAndUpdate(
        serviceId,
        { status: ServiceStatus.ACTIVE, banReason: null },
        { new: true },
      )
      .exec();

    if (!service) throw new NotFoundException('Service non trouvé');
    return service;
  }

  async getPendingCount(): Promise<number> {
    return this.serviceModel.countDocuments({
      status: ServiceStatus.PENDING_APPROVAL,
    });
  }

  async findRejected(): Promise<ServiceDocument[]> {
    return this.serviceModel
      .find({
        status: ServiceStatus.DISABLED,
        rejectionReason: { $ne: null, $exists: true },
      })
      .populate('providerId', 'firstName lastName email')
      .sort({ updatedAt: -1 })
      .exec();
  }
}
