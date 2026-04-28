// src/modules/services/services.service.ts

import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Service, ServiceDocument, ServiceCategory } from '../../database/schemas/service.schema';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';

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
        coordinates: createServiceDto.location.coordinates,
        address: createServiceDto.location.address,
        city: createServiceDto.location.city,
        governorate: createServiceDto.location.governorate,
        postalCode: createServiceDto.location.postalCode,
      },
    });

    return service.save();
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

  // backend/src/modules/services/services.service.ts
// Assurez-vous que findNearby utilise les bons champs

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
  async findPending(): Promise<Service[]> {
    return this.serviceModel
      .find({ isActive: false, isPendingApproval: true })
      .populate('providerId', 'firstName lastName email')
      .exec();
  }

  async approveService(serviceId: string): Promise<Service> {
    return this.serviceModel.findByIdAndUpdate(
      serviceId,
      { isActive: true, isPendingApproval: false },
      { new: true },
    ).exec();
  }

  async rejectService(serviceId: string, reason: string): Promise<Service> {
    return this.serviceModel.findByIdAndUpdate(
      serviceId,
      { isPendingApproval: false, rejectionReason: reason },
      { new: true },
    ).exec();
  }

  async getPendingCount(): Promise<number> {
    return this.serviceModel.countDocuments({ isActive: false, isPendingApproval: true });
  }
}