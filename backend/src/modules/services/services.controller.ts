// services.controller.ts - Version complète
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
import { ServiceCategory } from '../../database/schemas/service.schema';
import { UpdateServiceDto } from './dto/update-service.dto';
import { UpsertLocationDto } from './dto/upsert-location.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('services')
export class ServicesController {
  constructor(private servicesService: ServicesService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Request() req, @Body() createServiceDto: CreateServiceDto) {
    return this.servicesService.create(req.user._id, createServiceDto);
  }

  @Get()
  async findAll(
    @Query('category') category?: ServiceCategory,
    @Query('minPrice') minPrice?: number,
    @Query('maxPrice') maxPrice?: number,
    @Query('minRating') minRating?: number,
    @Query('limit') limit?: number,
    @Query('skip') skip?: number,
  ) {
    return this.servicesService.findAll({
      category,
      minPrice,
      maxPrice,
      minRating,
      limit,
      skip,
    });
  }

  @Get('nearby')
  async findNearby(
    @Query('lng') lng: string,
    @Query('lat') lat: string,
    @Query('radius') radius?: string,
  ) {
    return this.servicesService.findNearby(
      parseFloat(lng),
      parseFloat(lat),
      radius ? parseFloat(radius) : 10,
    );
  }

  @Get('provider')
  @UseGuards(JwtAuthGuard)
  async findByProvider(@Request() req) {
    return this.servicesService.findByProvider(req.user._id);
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.servicesService.findById(id);
  }

  @Put('location/upsert')
  @UseGuards(JwtAuthGuard)
  async upsertLocation(@Request() req, @Body() upsertLocationDto: UpsertLocationDto) {
    return this.servicesService.upsertLocation(req.user._id, upsertLocationDto);
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

  @Patch(':id/toggle-active')
  @UseGuards(JwtAuthGuard)
  async toggleActive(@Param('id') id: string, @Request() req) {
    return this.servicesService.toggleActive(id, req.user._id);
  }

  // ==================== ENDPOINTS ADMIN ====================


  // Dans getAllServicesAdmin, ajoutez un log
@Get('admin/all')
@UseGuards(JwtAuthGuard)
async getAllServicesAdmin(@Request() req) {
  console.log('User role:', req.user?.role); // Debug
  console.log('User object:', req.user); // Debug
  
  if (req.user.role !== 'admin') {
    throw new ForbiddenException('Accès réservé aux administrateurs. Votre rôle: ' + req.user?.role);
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
    @Request() req
  ) {
    if (req.user.role !== 'admin') {
      throw new ForbiddenException('Accès réservé aux administrateurs');
    }
    if (!reason || reason.trim() === '') {
      throw new BadRequestException('La raison du rejet est requise');
    }
    return this.servicesService.rejectService(id, reason);
  }
}