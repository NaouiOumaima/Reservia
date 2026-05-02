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
}