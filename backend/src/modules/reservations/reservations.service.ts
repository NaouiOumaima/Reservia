// src/modules/reservations/reservations.service.ts
import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { Reservation, ReservationDocument, ReservationStatus } from '../../database/schemas/reservation.schema';
import { Service, ServiceDocument } from '../../database/schemas/service.schema';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../../database/schemas/notification.schema';
import { NotificationsGateway } from '../websocket/notifications.gateway';

@Injectable()
export class ReservationsService {
  constructor(
    @InjectModel(Reservation.name) private reservationModel: Model<ReservationDocument>,
    @InjectModel(Service.name) private serviceModel: Model<ServiceDocument>,
    private configService: ConfigService,
    private notificationsService: NotificationsService,
    private notificationsGateway: NotificationsGateway,
  ) {}

  async create(clientId: string, createReservationDto: CreateReservationDto) {
    const { serviceId, numberOfPersons, reservationDateTime, notes } = createReservationDto;

    // Vérifier que la date n'est pas dans le passé
    const reservationDate = new Date(reservationDateTime);
    if (reservationDate < new Date()) {
      throw new BadRequestException('La date de réservation ne peut pas être dans le passé');
    }

    // Vérifier si le service existe
    const service = await this.serviceModel.findById(serviceId);
    if (!service || !service.isActive) {
      throw new NotFoundException('Service non trouvé ou indisponible');
    }

    // Vérifier la disponibilité pour cette date/heure
    const isAvailable = await this.checkAvailability(serviceId, reservationDate);
    if (!isAvailable) {
      throw new BadRequestException('Ce créneau horaire n\'est plus disponible');
    }

    // Délai d'expiration de la réservation en attente
    const pendingTimeout = this.configService.get<number>('reservation.pendingTimeoutMinutes') || 10;
    const expiresAt = new Date(Date.now() + pendingTimeout * 60000);

    // Créer la réservation SANS PRIX (100% gratuit)
    const reservation = new this.reservationModel({
      clientId: new Types.ObjectId(clientId),
      serviceId: new Types.ObjectId(serviceId),
      providerId: service.providerId, // Déjà un Types.ObjectId
      numberOfPersons,
      reservationDateTime: reservationDate,
      price: 0,
      status: ReservationStatus.PENDING,
      notes,
      expiresAt,
    });

    await reservation.save();

    // Envoyer une notification au prestataire
    const targetProviderId = service.providerId.toString();
    const formattedDate = reservationDate.toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    await this.notificationsService.create(
      targetProviderId,
      NotificationType.RESERVATION_PENDING,
      '📅 Nouvelle réservation en attente',
      `Nouvelle réservation pour "${service.name}" - ${numberOfPersons} personne(s) - ${formattedDate}`,
      reservation._id.toString(),
      { 
        serviceName: service.name, 
        clientId, 
        numberOfPersons, 
        reservationDateTime: formattedDate,
        notes 
      },
    );

    // Notification WebSocket
    this.notificationsGateway.sendReservationUpdateToProvider(targetProviderId, reservation);

    return reservation;
  }

  async checkAvailability(serviceId: string, dateTime: Date): Promise<boolean> {
    const existingReservation = await this.reservationModel.findOne({
      serviceId: new Types.ObjectId(serviceId),
      reservationDateTime: dateTime,
      status: ReservationStatus.CONFIRMED,
      expiresAt: { $gt: new Date() }
    });

    return !existingReservation;
  }

  async getAvailability(serviceId: string, dateTime: string): Promise<{ available: boolean; message: string }> {
    const targetDateTime = new Date(dateTime);
    
    if (targetDateTime < new Date()) {
      return {
        available: false,
        message: 'Cette date est déjà passée'
      };
    }

    const service = await this.serviceModel.findById(serviceId);
    if (!service || !service.isActive) {
      throw new NotFoundException('Service non trouvé ou indisponible');
    }

    const existingReservation = await this.reservationModel.findOne({
      serviceId: new Types.ObjectId(serviceId),
      reservationDateTime: targetDateTime,
      status: ReservationStatus.CONFIRMED,
      expiresAt: { $gt: new Date() }
    });

    if (existingReservation) {
      return {
        available: false,
        message: 'Ce créneau horaire est déjà réservé'
      };
    }

    return {
      available: true,
      message: 'Créneau disponible'
    };
  }

  async getAvailableSlotsForDay(serviceId: string, date: string): Promise<any[]> {
    const targetDate = new Date(date);
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    const service = await this.serviceModel.findById(serviceId);
    if (!service || !service.isActive) {
      throw new NotFoundException('Service non trouvé ou indisponible');
    }

    const confirmedReservations = await this.reservationModel.find({
      serviceId: new Types.ObjectId(serviceId),
      reservationDateTime: { $gte: startOfDay, $lte: endOfDay },
      status: ReservationStatus.CONFIRMED,
      expiresAt: { $gt: new Date() }
    });

    const availableSlots = [];
    const now = new Date();
    
    for (let hour = 8; hour <= 20; hour++) {
      const slotTime = new Date(targetDate);
      slotTime.setHours(hour, 0, 0, 0);
      
      const isBooked = confirmedReservations.some(r => 
        r.reservationDateTime.getHours() === hour
      );

      const isInPast = slotTime < now;

      if (!isBooked && !isInPast) {
        availableSlots.push({
          time: slotTime.toISOString(),
          hour: hour,
          minute: 0,
          available: true
        });
      }
    }

    return availableSlots;
  }

  // ✅ CORRIGÉ: Méthode confirm avec meilleure gestion des IDs
 async confirm(id: string, providerId: string) {
    const reservation = await this.findById(id);
    const service = await this.serviceModel.findById(reservation.serviceId);
    if (!service) throw new NotFoundException('Service non trouvé');

    // ✅ Récupérer le providerId de la réservation
    let reservationProviderId: string;
    
    if (reservation.providerId instanceof Types.ObjectId) {
      reservationProviderId = reservation.providerId.toString();
    } else if (typeof reservation.providerId === 'string') {
      reservationProviderId = reservation.providerId;
    } else if (reservation.providerId && typeof reservation.providerId === 'object' && '_id' in reservation.providerId) {
      reservationProviderId = (reservation.providerId as any)._id.toString();
    } else {
      // Fallback: utiliser le providerId du service
      reservationProviderId = service.providerId.toString();
    }

    const currentProviderId = providerId.toString();

    console.log('🔐 Vérification autorisation:', {
      reservationProviderId,
      currentProviderId,
      match: reservationProviderId === currentProviderId
    });

    if (reservationProviderId !== currentProviderId) {
      throw new ForbiddenException('Non autorisé - Vous n\'êtes pas le prestataire de ce service');
    }

    if (reservation.status !== ReservationStatus.PENDING) {
      throw new BadRequestException(`La réservation ne peut pas être confirmée (statut: ${reservation.status})`);
    }
    
    if (reservation.expiresAt < new Date()) {
      reservation.status = ReservationStatus.EXPIRED;
      await reservation.save();
      throw new BadRequestException('La réservation a expiré');
    }

    const isStillAvailable = await this.checkAvailability(
      reservation.serviceId.toString(), 
      reservation.reservationDateTime
    );
    
    if (!isStillAvailable) {
      throw new BadRequestException('Désolé, ce créneau a été réservé par quelqu\'un d\'autre entre-temps');
    }

    reservation.status = ReservationStatus.CONFIRMED;
    await reservation.save();

    await this.notificationsService.sendReservationConfirmation(
      reservation.clientId.toString(),
      { ...reservation.toObject(), service },
    );

    this.notificationsGateway.sendReservationUpdateToProvider(providerId, reservation);
    this.notificationsGateway.sendReservationUpdateToClient(reservation.clientId.toString(), reservation);

    return reservation;
  }

  // ✅ CORRIGÉ: Méthode cancel
  async cancel(id: string, userId: string, reason?: string) {
    const reservation = await this.findById(id);
    const service = await this.serviceModel.findById(reservation.serviceId);
    if (!service) throw new NotFoundException('Service non trouvé');

    const isClient = reservation.clientId.toString() === userId.toString();
    const isOwner = service.providerId.toString() === userId.toString();

    console.log('🔐 Vérification annulation:', {
      isClient,
      isOwner,
      clientId: reservation.clientId.toString(),
      providerId: service.providerId.toString(),
      userId: userId.toString()
    });

    if (!isClient && !isOwner) throw new ForbiddenException('Non autorisé');

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

    if (isOwner) this.notificationsGateway.sendReservationUpdateToProvider(userId, reservation);
    if (isClient) this.notificationsGateway.sendReservationUpdateToClient(userId, reservation);

    return reservation;
  }

  async complete(id: string, providerId: string) {
    const reservation = await this.findById(id);
    const service = await this.serviceModel.findById(reservation.serviceId);
    if (!service) throw new NotFoundException('Service non trouvé');

    if (service.providerId.toString() !== providerId.toString()) {
      throw new ForbiddenException('Non autorisé');
    }

    if (reservation.status !== ReservationStatus.CONFIRMED) {
      throw new BadRequestException('Seules les réservations confirmées peuvent être complétées');
    }

    reservation.status = ReservationStatus.COMPLETED;
    await reservation.save();

    this.notificationsGateway.sendReservationUpdateToProvider(providerId, reservation);
    this.notificationsGateway.sendReservationUpdateToClient(reservation.clientId.toString(), reservation);

    return reservation;
  }

  async accept(id: string, providerId: string) {
    return this.confirm(id, providerId);
  }

  async reject(id: string, providerId: string, reason?: string) {
    return this.cancel(id, providerId, reason || 'Refusé par le prestataire');
  }

  async findByClient(clientId: string) {
    return this.reservationModel
      .find({ clientId: new Types.ObjectId(clientId) })
      .sort({ reservationDateTime: -1 })
      .populate('serviceId', 'name images location avgRating')
      .exec();
  }

  async findByProvider(providerId: string) {
    // ✅ CORRIGÉ: Rechercher par providerId directement
    const reservations = await this.reservationModel
      .find({ providerId: new Types.ObjectId(providerId) })
      .sort({ reservationDateTime: -1 })
      .populate('serviceId', 'name images location')
      .populate('clientId', 'firstName lastName email phone')
      .exec();
    
    console.log(`📊 Réservations trouvées pour provider ${providerId}:`, reservations.length);
    
    return reservations;
  }

  private async findById(id: string) {
    const reservation = await this.reservationModel.findById(id);
    if (!reservation) throw new NotFoundException('Réservation non trouvée');
    return reservation;
  }
}