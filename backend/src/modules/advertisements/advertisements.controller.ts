// backend/src/modules/advertisements/advertisements.controller.ts
import { Controller, Get, Post, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { AdvertisementsService } from './advertisements.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ForbiddenException } from '@nestjs/common';

@Controller('advertisements')
@UseGuards(JwtAuthGuard)
export class AdvertisementsController {
  constructor(private advertisementsService: AdvertisementsService) {}

  @Post()
  async create(@Request() req, @Body() data: any) {
    if (req.user.role !== 'provider') {
      throw new ForbiddenException('Seuls les fournisseurs peuvent créer des annonces');
    }

    // ✅ Correction: Vérifier les champs qui existent
    const providerName = req.user.businessName || 
                         (req.user.firstName && req.user.lastName ? `${req.user.firstName} ${req.user.lastName}` : req.user.email || 'Fournisseur');

    const advertisement = await this.advertisementsService.create(req.user._id, {
      ...data,
      providerName: providerName,
    });

    // Envoyer les notifications aux clients ciblés
    await this.advertisementsService.sendNotificationsToTarget(advertisement);

    return advertisement;
  }

  @Get('provider')
  async getProviderAds(@Request() req) {
    return this.advertisementsService.findByProvider(req.user._id);
  }

  @Get(':id')
  async getOne(@Param('id') id: string, @Request() req) {
    return this.advertisementsService.findById(id, req.user._id);
  }

  @Delete(':id')
  async delete(@Param('id') id: string, @Request() req) {
    if (req.user.role !== 'provider') {
      throw new ForbiddenException('Accès refusé');
    }
    return this.advertisementsService.delete(id, req.user._id);
  }
}