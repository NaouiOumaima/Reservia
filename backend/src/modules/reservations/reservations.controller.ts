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

  @Get('availability/:serviceId')
  async getAvailability(
    @Param('serviceId') serviceId: string,
    @Query('date') date: string,
  ) {
    return this.reservationsService.getAvailability(serviceId, new Date(date));
  }
}