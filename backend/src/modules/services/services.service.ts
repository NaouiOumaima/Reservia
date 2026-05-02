import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Service, ServiceDocument, ServiceCategory } from '../../database/schemas/service.schema';
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

  // ✅ Méthode UPSERT corrigée
  async upsertLocation(providerId: string, upsertLocationDto: UpsertLocationDto) {
    const existingService = await this.serviceModel.findOne({ 
      providerId: new Types.ObjectId(providerId) 
    }).exec();

    // S'assurer que les coordonnées sont au bon format [lng, lat]
    const coordinates: [number, number] = [
      upsertLocationDto.location.coordinates.lng, 
      upsertLocationDto.location.coordinates.lat
    ];

    const locationData = {
      type: 'Point',
      coordinates: coordinates,
      address: upsertLocationDto.location.address,
      city: upsertLocationDto.location.city,
      governorate: upsertLocationDto.location.governorate,
      postalCode: upsertLocationDto.location.postalCode,
    };

    if (existingService) {
      // UPDATE: mettre à jour le service existant
      existingService.location = locationData;
      // Note: updatedAt est géré automatiquement par Mongoose grâce à timestamps: true
      await existingService.save();
      return {
        action: 'updated',
        service: existingService
      };
    } else {
      // CREATE: créer un nouveau service avec localisation minimale
      const newService = new this.serviceModel({
        providerId: new Types.ObjectId(providerId),
        name: 'Mon Service',
        category: ServiceCategory.OTHER,
        description: 'Service créé via la localisation',
        basePrice: 0,
        duration: 60,
        location: locationData,
        isActive: true,
        isPendingApproval: true, // En attente d'approbation
      });
      await newService.save();
      return {
        action: 'created',
        service: newService
      };
    }
  }

  async findAll(query?: {
    category?: ServiceCategory;
    minPrice?: number;
    maxPrice?: number;
    minRating?: number;
    limit?: number;
    skip?: number;
  }) {
    const filter: any = { isActive: true };

    if (query?.category) filter.category = query.category;
    if (query?.minPrice !== undefined) filter.basePrice = { $gte: query.minPrice };
    if (query?.maxPrice !== undefined) filter.basePrice = { ...filter.basePrice, $lte: query.maxPrice };
    if (query?.minRating !== undefined) filter.avgRating = { $gte: query.minRating };

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

  async findById(id: string) {
    const service = await this.serviceModel
      .findById(id)
      .populate('providerId', 'firstName lastName email providerProfile.businessName phone')
      .exec();

    if (!service) {
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
      const services = await this.serviceModel
        .find({
          isActive: true,
          location: {
            $near: {
              $geometry: {
                type: 'Point',
                coordinates: [lng, lat],
              },
              $maxDistance: radius * 1000,
            },
          },
        })
        .limit(50)
        .exec();
      
      return services;
    } catch (error) {
      console.error('Erreur findNearby:', error);
      return [];
    }
  }

  async update(id: string, providerId: string, updateServiceDto: UpdateServiceDto) {
    const service = await this.findById(id);

    if (service.providerId.toString() !== providerId) {
      throw new ForbiddenException('Vous n\'êtes pas autorisé à modifier ce service');
    }

    // Si la location est mise à jour, s'assurer que les coordonnées sont au bon format
    if (updateServiceDto.location) {
      const location = updateServiceDto.location as any;
      if (location.coordinates && Array.isArray(location.coordinates)) {
        location.coordinates = [location.coordinates[0], location.coordinates[1]] as [number, number];
      }
    }

    Object.assign(service, updateServiceDto);
    return service.save();
  }

  async delete(id: string, providerId: string) {
    const service = await this.findById(id);

    if (service.providerId.toString() !== providerId) {
      throw new ForbiddenException('Vous n\'êtes pas autorisé à supprimer ce service');
    }

    return this.serviceModel.findByIdAndDelete(id);
  }

  async toggleActive(id: string, providerId: string) {
    const service = await this.findById(id);

    if (service.providerId.toString() !== providerId) {
      throw new ForbiddenException('Vous n\'êtes pas autorisé à modifier ce service');
    }

    service.isActive = !service.isActive;
    return service.save();
  }

  async updateSmartScore(serviceId: string, score: number) {
    return this.serviceModel.findByIdAndUpdate(serviceId, { smartScore: score });
  }

  async incrementPopularity(serviceId: string) {
    return this.serviceModel.findByIdAndUpdate(serviceId, { $inc: { popularity: 1 } });
  }

  // Admin methods
  async findPending(): Promise<ServiceDocument[]> {
    return this.serviceModel
      .find({ isActive: false, isPendingApproval: true })
      .populate('providerId', 'firstName lastName email')
      .exec();
  }

  async approveService(serviceId: string): Promise<ServiceDocument> {
    return this.serviceModel.findByIdAndUpdate(
      serviceId,
      { isActive: true, isPendingApproval: false },
      { new: true },
    ).exec() as Promise<ServiceDocument>;
  }

  async rejectService(serviceId: string, reason: string): Promise<ServiceDocument> {
    return this.serviceModel.findByIdAndUpdate(
      serviceId,
      { isPendingApproval: false, rejectionReason: reason },
      { new: true },
    ).exec() as Promise<ServiceDocument>;
  }

  async getPendingCount(): Promise<number> {
    return this.serviceModel.countDocuments({ isActive: false, isPendingApproval: true });
  }
}