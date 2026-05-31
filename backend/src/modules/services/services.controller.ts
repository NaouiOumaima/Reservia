// backend/src/modules/services/services.controller.ts

import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  Patch,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { ServicesService } from './services.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { UpsertLocationDto } from './dto/upsert-location.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('services')
export class ServicesController {
  constructor(private servicesService: ServicesService) {}

  // ==================== ROUTES PUBLIQUES (Clients) ====================

  @Get()
  async findAll(
    @Query('category') category?: string,
    @Query('minRating') minRating?: number,
    @Query('limit') limit?: number,
    @Query('skip') skip?: number,
  ) {
    return this.servicesService.findAll({
      category,
      minRating,
      limit: limit ? parseInt(limit.toString()) : 50,
      skip: skip ? parseInt(skip.toString()) : 0,
    });
  }

  @Get('nearby')
  async findNearby(
    @Query('lng') lng: string,
    @Query('lat') lat: string,
    @Query('radius') radius?: string,
    @Query('category') category?: string,
  ) {
    if (!lng || !lat) {
      throw new BadRequestException('lng et lat sont requis');
    }
    return this.servicesService.findNearby(
      parseFloat(lng),
      parseFloat(lat),
      radius ? parseFloat(radius) : 10,
      category,
    );
  }

  @Get('search/text')
  async searchByText(
    @Query('q') searchTerm: string,
    @Query('lng') lng?: string,
    @Query('lat') lat?: string,
    @Query('radius') radius?: string,
    @Query('category') category?: string,
  ) {
    if (!searchTerm || searchTerm.trim() === '') {
      throw new BadRequestException('Le terme de recherche est requis');
    }
    return this.servicesService.searchByText(
      searchTerm.trim(),
      lng ? parseFloat(lng) : undefined,
      lat ? parseFloat(lat) : undefined,
      radius ? parseFloat(radius) : undefined,
      category,
    );
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.servicesService.findById(id);
  }

  // ==================== ROUTES ADMIN ====================

  @Get('admin/all')
  @UseGuards(JwtAuthGuard)
  async getAllServicesAdmin(@Request() req) {
    if (req.user.role !== 'admin') {
      throw new ForbiddenException('Accès réservé aux administrateurs');
    }
    return this.servicesService.findAllAdmin();
  }

  @Get('admin/pending')
  @UseGuards(JwtAuthGuard)
  async getPendingServices(@Request() req) {
    if (req.user.role !== 'admin') {
      throw new ForbiddenException('Accès réservé aux administrateurs');
    }
    return this.servicesService.findPending();
  }

  @Get('admin/pending/count')
  @UseGuards(JwtAuthGuard)
  async getPendingCount(@Request() req) {
    if (req.user.role !== 'admin') {
      throw new ForbiddenException('Accès réservé aux administrateurs');
    }
    const count = await this.servicesService.getPendingCount();
    return { count };
  }

  @Patch('admin/:id/approve')
  @UseGuards(JwtAuthGuard)
  async approveService(@Param('id') id: string, @Request() req) {
    if (req.user.role !== 'admin') {
      throw new ForbiddenException('Accès réservé aux administrateurs');
    }
    return this.servicesService.approveService(id);
  }

  @Patch('admin/:id/reject')
  @UseGuards(JwtAuthGuard)
  async rejectService(
    @Param('id') id: string,
    @Body('reason') reason: string,
    @Request() req,
  ) {
    if (req.user.role !== 'admin') {
      throw new ForbiddenException('Accès réservé aux administrateurs');
    }
    if (!reason || reason.trim() === '') {
      throw new BadRequestException('La raison du rejet est requise');
    }
    return this.servicesService.rejectService(id, reason);
  }

  // ==================== ROUTES PROVIDER (authentifiées) ====================

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Request() req, @Body() createServiceDto: CreateServiceDto) {
    return this.servicesService.create(req.user._id, createServiceDto);
  }

// backend/src/modules/services/services.controller.ts

@Get('provider')
@UseGuards(JwtAuthGuard)
async findByProvider(@Request() req) {
  console.log('Finding services for provider:', req.user._id);
  return this.servicesService.findByProvider(req.user._id);
}

  @Patch(':id/location')
  @UseGuards(JwtAuthGuard)
  async updateLocation(
    @Param('id') id: string,
    @Request() req,
    @Body() upsertLocationDto: UpsertLocationDto,
  ) {
    return this.servicesService.updateLocation(id, req.user._id, upsertLocationDto);
  }

  @Patch(':id/availability')
  @UseGuards(JwtAuthGuard)
  async updateAvailability(
    @Param('id') id: string,
    @Request() req,
    @Body() body: {
      slots?: { duration: number; maxReservationsPerSlot: number }[];
      openingHours?: { [key: string]: { open: string; close: string } };
      duration?: number;
      cancellationPolicy?: { minHoursBefore: number; refundPercentage: number };
    },
  ) {
    return this.servicesService.updateAvailability(id, req.user._id, body);
  }

  @Patch(':id/toggle-active')
  @UseGuards(JwtAuthGuard)
  async toggleActive(@Param('id') id: string, @Request() req) {
    return this.servicesService.toggleActive(id, req.user._id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id') id: string,
    @Request() req,
    @Body() updateServiceDto: UpdateServiceDto,
  ) {
    return this.servicesService.update(id, req.user._id, updateServiceDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async delete(@Param('id') id: string, @Request() req) {
    return this.servicesService.delete(id, req.user._id);
  }

  // ==================== ROUTE LEGACY ====================

  @Put('location/upsert')
  @UseGuards(JwtAuthGuard)
  async upsertLocation(@Request() req, @Body() upsertLocationDto: UpsertLocationDto) {
    return this.servicesService.upsertLocation(req.user._id, upsertLocationDto);
  }
}
