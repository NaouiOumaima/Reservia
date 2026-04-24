// src/modules/reservations/reservations.service.ts

import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { Reservation, ReservationDocument, ReservationStatus } from '../../database/schemas/reservation.schema';
import { Service, ServiceDocument } from '../../database/schemas/service.schema';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class ReservationsService {
  constructor(
    @InjectModel(Reservation.name) private reservationModel: Model<ReservationDocument>,
    @InjectModel(Service.name) private serviceModel: Model<ServiceDocument>,
    private configService: ConfigService,
    private notificationsService: NotificationsService,
  ) {}

  async create(clientId: string, createReservationDto: CreateReservationDto) {
    const { serviceId, startTime, duration, notes } = createReservationDto;

    const service = await this.serviceModel.findById(serviceId);
    if (!service || !service.isActive) {
      throw new NotFoundException('Service non trouvé ou indisponible');
    }

    const start = new Date(startTime);
    const end = new Date(start.getTime() + duration * 60000);

    const isAvailable = await this.checkAvailability(serviceId, start, end);
    if (!isAvailable) {
      throw new BadRequestException('Créneau non disponible');
    }

    const price = service.discountPrice || service.basePrice;
    const pendingTimeout = this.configService.get<number>('reservation.pendingTimeoutMinutes') || 10;
    const expiresAt = new Date(Date.now() + pendingTimeout * 60000);

    const reservation = new this.reservationModel({
      clientId: new Types.ObjectId(clientId),
      serviceId: new Types.ObjectId(serviceId),
      startTime: start,
      endTime: end,
      duration,
      price,
      status: ReservationStatus.PENDING,
      notes,
      expiresAt,
    });

    await reservation.save();
    this.scheduleExpiration(reservation._id.toString(), expiresAt);

    return reservation;
  }

  async confirm(id: string, providerId: string) {
    const reservation = await this.findById(id);
    const service = await this.serviceModel.findById(reservation.serviceId);
    
    if (!service) {
      throw new NotFoundException('Service non trouvé');
    }
    
    if (service.providerId.toString() !== providerId) {
      throw new ForbiddenException('Non autorisé');
    }

    if (reservation.status !== ReservationStatus.PENDING) {
      throw new BadRequestException(`La réservation ne peut pas être confirmée (statut: ${reservation.status})`);
    }

    if (reservation.expiresAt < new Date()) {
      reservation.status = ReservationStatus.EXPIRED;
      await reservation.save();
      throw new BadRequestException('La réservation a expiré');
    }

    reservation.status = ReservationStatus.CONFIRMED;
    await reservation.save();

    await this.notificationsService.sendReservationConfirmation(
      reservation.clientId.toString(),
      { ...reservation.toObject(), service },
    );

    return reservation;
  }

  async cancel(id: string, userId: string, reason?: string) {
    const reservation = await this.findById(id);
    const service = await this.serviceModel.findById(reservation.serviceId);
    
    if (!service) {
      throw new NotFoundException('Service non trouvé');
    }

    const isClient = reservation.clientId.toString() === userId;
    const isOwner = service.providerId.toString() === userId;

    if (!isClient && !isOwner) {
      throw new ForbiddenException('Non autorisé');
    }

    if (reservation.status !== ReservationStatus.PENDING && reservation.status !== ReservationStatus.CONFIRMED) {
      throw new BadRequestException(`La réservation ne peut pas être annulée (statut: ${reservation.status})`);
    }

    reservation.status = ReservationStatus.CANCELLED;
    reservation.cancelledAt = new Date();
    reservation.cancellationReason = reason;
    await reservation.save();

    await this.notificationsService.sendReservationCancellation(
      reservation.clientId.toString(),
      { ...reservation.toObject(), service },
    );

    return reservation;
  }

  async complete(id: string, providerId: string) {
    const reservation = await this.findById(id);
    const service = await this.serviceModel.findById(reservation.serviceId);
    
    if (!service) {
      throw new NotFoundException('Service non trouvé');
    }
    
    if (service.providerId.toString() !== providerId) {
      throw new ForbiddenException('Non autorisé');
    }

    if (reservation.status !== ReservationStatus.CONFIRMED) {
      throw new BadRequestException('Seules les réservations confirmées peuvent être complétées');
    }

    reservation.status = ReservationStatus.COMPLETED;
    await reservation.save();

    return reservation;
  }

  async findByClient(clientId: string) {
    return this.reservationModel
      .find({ clientId: new Types.ObjectId(clientId) })
      .sort({ createdAt: -1 })
      .populate('serviceId', 'name images location avgRating')
      .exec();
  }

  async findByProvider(providerId: string) {
    const services = await this.serviceModel.find({ providerId: new Types.ObjectId(providerId) });
    const serviceIds = services.map(s => s._id);

    return this.reservationModel
      .find({ serviceId: { $in: serviceIds } })
      .sort({ createdAt: -1 })
      .populate('serviceId', 'name')
      .populate('clientId', 'firstName lastName email phone')
      .exec();
  }

  async getAvailability(serviceId: string, date: Date) {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);

    const end = new Date(date);
    end.setHours(23, 59, 59, 999);

    const reservations = await this.reservationModel.find({
      serviceId: new Types.ObjectId(serviceId),
      status: { $in: [ReservationStatus.PENDING, ReservationStatus.CONFIRMED] },
      startTime: { $gte: start, $lte: end },
    });

    return reservations.map(r => ({
      startTime: r.startTime,
      endTime: r.endTime,
      status: r.status,
    }));
  }

  private async findById(id: string) {
    const reservation = await this.reservationModel.findById(id);
    if (!reservation) {
      throw new NotFoundException('Réservation non trouvée');
    }
    return reservation;
  }

  private async checkAvailability(serviceId: string, start: Date, end: Date): Promise<boolean> {
    const existing = await this.reservationModel.findOne({
      serviceId: new Types.ObjectId(serviceId),
      status: { $in: [ReservationStatus.PENDING, ReservationStatus.CONFIRMED] },
      $or: [
        { startTime: { $lt: end, $gte: start } },
        { endTime: { $gt: start, $lte: end } },
        { startTime: { $lte: start }, endTime: { $gte: end } },
      ],
    });

    return !existing;
  }

  private scheduleExpiration(reservationId: string, expiresAt: Date) {
    const delay = expiresAt.getTime() - Date.now();
    if (delay <= 0) return;

    setTimeout(async () => {
      const reservation = await this.reservationModel.findById(reservationId);
      if (reservation && reservation.status === ReservationStatus.PENDING) {
        reservation.status = ReservationStatus.EXPIRED;
        await reservation.save();

        const service = await this.serviceModel.findById(reservation.serviceId);
        await this.notificationsService.sendExpirationWarning(
          reservation.clientId.toString(),
          { ...reservation.toObject(), service },
        );
      }
    }, delay);
  }
}