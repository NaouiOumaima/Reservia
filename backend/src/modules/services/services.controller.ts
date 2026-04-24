// src/modules/services/services.controller.ts

import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Request, Patch } from '@nestjs/common';
import { ServicesService } from './services.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { ServiceCategory } from '../../database/schemas/service.schema';
import { UpdateServiceDto } from './dto/service.dto';
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
    return this.servicesService.findAll({ category, minPrice, maxPrice, minRating, limit, skip });
  }

  @Get('nearby')
  async findNearby(
    @Query('lng') lng: number,
    @Query('lat') lat: number,
    @Query('radius') radius?: number,
  ) {
    return this.servicesService.findNearby(lng, lat, radius);
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

  // Admin endpoints
  @Get('admin/pending')
  @UseGuards(JwtAuthGuard)
  async findPending() {
    return this.servicesService.findPending();
  }

  @Patch('admin/:id/approve')
  @UseGuards(JwtAuthGuard)
  async approveService(@Param('id') id: string) {
    return this.servicesService.approveService(id);
  }

  @Patch('admin/:id/reject')
  @UseGuards(JwtAuthGuard)
  async rejectService(@Param('id') id: string, @Body('reason') reason: string) {
    return this.servicesService.rejectService(id, reason);
  }

  @Get('admin/pending/count')
  @UseGuards(JwtAuthGuard)
  async getPendingCount() {
    const count = await this.servicesService.getPendingCount();
    return { count };
  }
}