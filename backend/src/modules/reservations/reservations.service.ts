// src/modules/reservations/reservations.service.ts

import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Interval } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import {
  Reservation,
  ReservationDocument,
  ReservationStatus,
} from '../../database/schemas/reservation.schema';
import {
  Service,
  ServiceDocument,
  ServiceStatus,
} from '../../database/schemas/service.schema';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationsGateway } from '../websocket/notifications.gateway';

// Jours tels que stockés dans service.availabilitySlots (cf.
// frontend/app/provider/availability/page.tsx)
const FRENCH_DAYS = [
  'Dimanche',
  'Lundi',
  'Mardi',
  'Mercredi',
  'Jeudi',
  'Vendredi',
  'Samedi',
];

@Injectable()
export class ReservationsService {
  private readonly logger = new Logger(ReservationsService.name);

  constructor(
    @InjectModel(Reservation.name)
    private reservationModel: Model<ReservationDocument>,
    @InjectModel(Service.name) private serviceModel: Model<ServiceDocument>,
    private configService: ConfigService,
    private notificationsService: NotificationsService,
    private notificationsGateway: NotificationsGateway,
  ) {}

  async create(clientId: string, createReservationDto: CreateReservationDto) {
    const { serviceId, startTime, duration, notes } = createReservationDto;

    const service = await this.serviceModel.findById(serviceId);
    if (!service || service.status !== ServiceStatus.ACTIVE) {
      throw new NotFoundException('Service non trouvé ou indisponible');
    }

    const start = new Date(startTime);
    const end = new Date(start.getTime() + duration * 60000);

    if (!this.isWithinAvailabilitySlot(service, start, end)) {
      throw new BadRequestException('Créneau non disponible');
    }

    const pendingTimeout =
      this.configService.get<number>('reservation.pendingTimeoutMinutes') || 60;
    const expiresAt = new Date(Date.now() + pendingTimeout * 60000);

    const reservation = new this.reservationModel({
      clientId: new Types.ObjectId(clientId),
      serviceId: new Types.ObjectId(serviceId),
      startTime: start,
      endTime: end,
      duration,
      status: ReservationStatus.PENDING,
      notes,
      expiresAt,
    });

    await reservation.save();

    this.notificationsGateway.emitReservationUpdate(
      service.providerId.toString(),
      reservation,
    );

    return reservation;
  }

  async confirm(id: string, providerId: string) {
    const reservation = await this.findById(id);
    const service = await this.serviceModel.findById(reservation.serviceId);

    if (!service) throw new NotFoundException('Service non trouvé');
    if (service.providerId.toString() !== providerId)
      throw new ForbiddenException('Non autorisé');

    if (reservation.status !== ReservationStatus.PENDING) {
      throw new BadRequestException(
        `La réservation ne peut pas être confirmée (statut: ${reservation.status})`,
      );
    }

    if (reservation.expiresAt < new Date()) {
      reservation.status = ReservationStatus.CANCELLED;
      reservation.cancelledAt = new Date();
      reservation.cancellationReason =
        'Non traité par le prestataire dans le délai imparti';
      await reservation.save();
      throw new BadRequestException('La réservation a expiré');
    }

    reservation.status = ReservationStatus.CONFIRMED;
    await reservation.save();

    await this.notificationsService.sendReservationConfirmation(
      reservation.clientId.toString(),
      { ...reservation.toObject(), service },
    );
    this.emitToBoth(reservation, service.providerId.toString());

    return reservation;
  }

  async cancel(id: string, userId: string, reason?: string) {
    const reservation = await this.findById(id);
    const service = await this.serviceModel.findById(reservation.serviceId);

    if (!service) throw new NotFoundException('Service non trouvé');

    const isClient = reservation.clientId.toString() === userId;
    const isOwner = service.providerId.toString() === userId;

    if (!isClient && !isOwner) throw new ForbiddenException('Non autorisé');

    if (
      reservation.status !== ReservationStatus.PENDING &&
      reservation.status !== ReservationStatus.CONFIRMED
    ) {
      throw new BadRequestException(
        `La réservation ne peut pas être annulée (statut: ${reservation.status})`,
      );
    }

    reservation.status = ReservationStatus.CANCELLED;
    reservation.cancelledAt = new Date();
    reservation.cancellationReason = reason;
    await reservation.save();

    await this.notificationsService.sendReservationCancellation(
      reservation.clientId.toString(),
      { ...reservation.toObject(), service },
    );
    this.emitToBoth(reservation, service.providerId.toString());

    return reservation;
  }

  async complete(id: string, providerId: string) {
    const reservation = await this.findById(id);
    const service = await this.serviceModel.findById(reservation.serviceId);

    if (!service) throw new NotFoundException('Service non trouvé');
    if (service.providerId.toString() !== providerId)
      throw new ForbiddenException('Non autorisé');

    if (reservation.status !== ReservationStatus.CONFIRMED) {
      throw new BadRequestException(
        'Seules les réservations confirmées peuvent être complétées',
      );
    }

    reservation.status = ReservationStatus.COMPLETED;
    await reservation.save();
    this.emitToBoth(reservation, service.providerId.toString());

    return reservation;
  }

  async findByClient(clientId: string) {
    const reservations = await this.reservationModel
      .find({ clientId: new Types.ObjectId(clientId) })
      .sort({ createdAt: -1 })
      .populate({
        path: 'serviceId',
        select: 'name images location avgRating providerId',
        populate: {
          path: 'providerId',
          select: 'firstName lastName providerProfile.businessName',
        },
      })
      .exec();

    // Aplatit le service/provider peuplés pour correspondre au type Reservation du frontend
    return reservations.map((r) => {
      const service: any = r.serviceId;
      const provider: any = service?.providerId;
      const providerName =
        provider?.providerProfile?.businessName ||
        [provider?.firstName, provider?.lastName].filter(Boolean).join(' ') ||
        undefined;

      return {
        ...r.toObject(),
        serviceId: service?._id ?? r.serviceId,
        serviceName: service?.name,
        serviceLocation: service?.location,
        providerName,
      };
    });
  }

  async findByProvider(
    providerId: string,
    filters?: { serviceId?: string; status?: string },
  ) {
    const services = await this.serviceModel.find({
      providerId: new Types.ObjectId(providerId),
    });
    const serviceIds = services.map((s) => s._id);

    const query: any = { serviceId: { $in: serviceIds } };
    if (filters?.serviceId) {
      query.serviceId = new Types.ObjectId(filters.serviceId);
    }
    if (filters?.status) {
      query.status = filters.status;
    }

    const reservations = await this.reservationModel
      .find(query)
      .sort({ createdAt: -1 })
      .populate('serviceId', 'name')
      .populate('clientId', 'firstName lastName email phone')
      .exec();

    // Aplatit pour correspondre au type Reservation du frontend
    // (serviceName + customerInfo à plat)
    return reservations.map((r) => {
      const service: any = r.serviceId;
      const client: any = r.clientId;

      return {
        ...r.toObject(),
        serviceId: service?._id ?? r.serviceId,
        serviceName: service?.name,
        customerInfo: client
          ? {
              name: [client.firstName, client.lastName]
                .filter(Boolean)
                .join(' '),
              email: client.email,
              phone: client.phone,
            }
          : undefined,
      };
    });
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

    return reservations.map((r) => ({
      startTime: r.startTime,
      endTime: r.endTime,
      status: r.status,
    }));
  }

  private async findById(id: string) {
    const reservation = await this.reservationModel.findById(id);
    if (!reservation) throw new NotFoundException('Réservation non trouvée');
    return reservation;
  }

  // La disponibilité se vérifie contre les créneaux fixés à la création du
  // service (availabilitySlots), pas contre le nombre de réservations déjà
  // prises sur ce créneau.
  private isWithinAvailabilitySlot(
    service: ServiceDocument,
    start: Date,
    end: Date,
  ): boolean {
    const slots = service.availabilitySlots || [];
    if (slots.length === 0) return true;

    const dayName = FRENCH_DAYS[start.getDay()];
    const toMinutes = (d: Date) => d.getHours() * 60 + d.getMinutes();
    const parseTime = (t: string) => {
      const [h, m] = t.split(':').map(Number);
      return h * 60 + (m || 0);
    };

    return slots.some((slot) => {
      if (!slot.isAvailable || slot.day !== dayName) return false;
      const slotStart = parseTime(slot.startTime);
      const slotEnd = parseTime(slot.endTime);
      return toMinutes(start) >= slotStart && toMinutes(end) <= slotEnd;
    });
  }

  private emitToBoth(reservation: ReservationDocument, providerId: string) {
    this.notificationsGateway.emitReservationUpdate(
      reservation.clientId.toString(),
      reservation,
    );
    this.notificationsGateway.emitReservationUpdate(providerId, reservation);
  }

  // Balayage périodique : annule les PENDING non traitées à temps par le
  // prestataire, et expire les CONFIRMED dont le rendez-vous est dépassé.
  @Interval(60_000)
  async sweepReservationLifecycle() {
    try {
      const now = new Date();
      const confirmedGraceMinutes =
        this.configService.get<number>('reservation.confirmedGraceMinutes') ||
        60;

      const expiredPending = await this.reservationModel.find({
        status: ReservationStatus.PENDING,
        expiresAt: { $lt: now },
      });

      for (const reservation of expiredPending) {
        reservation.status = ReservationStatus.CANCELLED;
        reservation.cancelledAt = now;
        reservation.cancellationReason =
          'Non traité par le prestataire dans le délai imparti';
        await reservation.save();

        const service = await this.serviceModel.findById(reservation.serviceId);
        await this.notificationsService.sendReservationCancellation(
          reservation.clientId.toString(),
          { ...reservation.toObject(), service },
        );
        if (service)
          this.emitToBoth(reservation, service.providerId.toString());
      }

      const staleConfirmed = await this.reservationModel.find({
        status: ReservationStatus.CONFIRMED,
        startTime: {
          $lt: new Date(now.getTime() - confirmedGraceMinutes * 60000),
        },
      });

      for (const reservation of staleConfirmed) {
        reservation.status = ReservationStatus.EXPIRED;
        await reservation.save();

        const service = await this.serviceModel.findById(reservation.serviceId);
        await this.notificationsService.sendExpirationWarning(
          reservation.clientId.toString(),
          { ...reservation.toObject(), service },
        );
        if (service)
          this.emitToBoth(reservation, service.providerId.toString());
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Erreur lors du balayage des réservations: ${message}`);
    }
  }
}
