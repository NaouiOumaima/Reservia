// src/modules/reservations/reservations.controller.ts
import { Controller, Post, Get, Put, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ReservationsService } from './reservations.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('reservations')
export class ReservationsController {
  constructor(private reservationsService: ReservationsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Request() req, @Body() createReservationDto: CreateReservationDto) {
    return this.reservationsService.create(req.user._id, createReservationDto);
  }

  // ✅ Endpoint pour vérifier la disponibilité d'une date/heure spécifique
  @Get('availability')
  async getAvailability(
    @Query('serviceId') serviceId: string,
    @Query('dateTime') dateTime: string,
  ) {
    return this.reservationsService.getAvailability(serviceId, dateTime);
  }

  // ✅ Optionnel: Endpoint pour obtenir tous les créneaux disponibles d'une journée
  @Get('available-slots')
  async getAvailableSlots(
    @Query('serviceId') serviceId: string,
    @Query('date') date: string,
  ) {
    return this.reservationsService.getAvailableSlotsForDay(serviceId, date);
  }

  @Post(':id/confirm')
  @UseGuards(JwtAuthGuard)
  async confirm(@Param('id') id: string, @Request() req) {
    return this.reservationsService.confirm(id, req.user._id);
  }

  @Post(':id/cancel')
  @UseGuards(JwtAuthGuard)
  async cancel(
    @Param('id') id: string,
    @Request() req,
    @Body('reason') reason?: string,
  ) {
    return this.reservationsService.cancel(id, req.user._id, reason);
  }

  @Post(':id/complete')
  @UseGuards(JwtAuthGuard)
  async complete(@Param('id') id: string, @Request() req) {
    return this.reservationsService.complete(id, req.user._id);
  }

  @Get('my')
  @UseGuards(JwtAuthGuard)
  async getMyReservations(@Request() req) {
    return this.reservationsService.findByClient(req.user._id);
  }

  @Get('provider')
  @UseGuards(JwtAuthGuard)
  async getProviderReservations(@Request() req) {
    return this.reservationsService.findByProvider(req.user._id);
  }

  @Post(':id/accept')
  @UseGuards(JwtAuthGuard)
  async accept(@Param('id') id: string, @Request() req) {
    return this.reservationsService.accept(id, req.user._id);
  }

  @Post(':id/reject')
  @UseGuards(JwtAuthGuard)
  async reject(
    @Param('id') id: string,
    @Request() req,
    @Body('reason') reason?: string,
  ) {
    return this.reservationsService.reject(id, req.user._id, reason);
  }
}